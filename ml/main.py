from pyspark.sql import SparkSession
from pyspark.sql.functions import when, lit, col, sum, explode, split, to_timestamp, current_timestamp
from pyspark.sql.types import IntegerType
from pyspark.ml.evaluation import RegressionEvaluator
from pyspark.ml.recommendation import ALS
import time
import os

start_time = time.time()

spark = SparkSession\
        .builder\
        .appName("ALS")\
        .config("spark.driver.host","localhost")\
        .config("spark.jars", "./postgresql-42.6.0.jar") \
        .getOrCreate()

dbUrl = os.environ.get('DB_URL')
dbUser = os.environ.get('DB_USER')
dbPassword = os.environ.get('DB_PASSWORD')

dbProperties = {"user": dbUser,"password": dbPassword,
                "driver": "org.postgresql.Driver"}

print("data loading...")

# data read and preparation

attendanceFromDB = spark.read.jdbc(dbUrl,'public."Attend"', properties=dbProperties)
attendance=attendanceFromDB.select("groupId","userId","type") \
            .withColumn("rank", when((attendanceFromDB['type'] == 'ONLINE'), 1) \
                                .when((attendanceFromDB['type'] == 'OFFLINE'), 1) \
                                .otherwise(lit("0")))

attendance = attendance.withColumn("rank", col('rank').cast(IntegerType()))

categoriesFromDB = spark.read.jdbc(dbUrl,'public."Category"', properties=dbProperties)

level0Categories = categoriesFromDB.select(col("id").alias("lvl0id"),col("name").alias("lvl0name"),col("parentId").alias("lvl0parentId")).filter(col("level") == 0)
level1Categories = categoriesFromDB.select(col("id").alias("lvl1id"),col("name").alias("lvl1name"),col("parentId").alias("lvl1parentId")).filter(col("level") == 1)
level2Categories = categoriesFromDB.select(col("id").alias("lvl2id"),col("name").alias("lvl2name"),col("parentId").alias("lvl2parentId")).filter(col("level") == 2)
level3Categories = categoriesFromDB.select(col("id").alias("lvl3id"),col("name").alias("lvl3name"),col("parentId").alias("lvl3parentId")).filter(col("level") == 3)

lvl01JoinedDF = level1Categories.join(level0Categories, level1Categories.lvl1parentId == level0Categories.lvl0id)
lvl012JoinedDF = level2Categories.join(lvl01JoinedDF, level2Categories.lvl2parentId == lvl01JoinedDF.lvl1id)
lvl0123JoinedDF = level3Categories.join(lvl012JoinedDF, level3Categories.lvl3parentId == lvl012JoinedDF.lvl2id)

categories = lvl0123JoinedDF.select("lvl0id", "lvl0name", "lvl3id","lvl3name")

groupsFromDB = spark.read.jdbc(dbUrl,'public."Group"', properties=dbProperties)
groups=groupsFromDB.select(col("id").alias("groupId"),col("categoryId"))
groupsWithLevelIds = categories.join(groups, categories.lvl3id == groups.categoryId).drop("categoryId")

attendanceWithLevelIds=attendance.join(groupsWithLevelIds, 'groupId')

#level3 model fit
print("model fit...")
interestsLvl3 = attendanceWithLevelIds.groupBy("userId", "lvl3id").agg(sum("rank").alias("rank"))

(trainingInterestsLvl3, testInterestsLvl3) = interestsLvl3.randomSplit([0.8, 0.2])

alsInterestsLvl3 = ALS(maxIter=5,rank=100, regParam=0.01, userCol="userId", itemCol="lvl3id", ratingCol="rank",
          coldStartStrategy="drop")

modelInterestsLvl3 = alsInterestsLvl3.fit(trainingInterestsLvl3)

predictionsInterestsLvl3 = modelInterestsLvl3.transform(testInterestsLvl3)
evaluatorInterestsLvl3 = RegressionEvaluator(metricName="rmse", labelCol="rank",
                                predictionCol="prediction")
rmseInterestsLvl3 = evaluatorInterestsLvl3.evaluate(predictionsInterestsLvl3)
print("Root-mean-square error = " + str(rmseInterestsLvl3))

#level0 model fit
interestsLvl0 = attendanceWithLevelIds.groupBy("userId", "lvl0id").agg(sum("rank").alias("rank"))

(trainingInterestsLvl0, testInterestsLvl0) = interestsLvl0.randomSplit([0.8, 0.2])

alsInterestsLvl0 = ALS(maxIter=5,rank=100, regParam=0.01, userCol="userId", itemCol="lvl0id", ratingCol="rank",
          coldStartStrategy="drop")

modelInterestsLvl0 = alsInterestsLvl0.fit(trainingInterestsLvl0)

predictionsInterestsLvl0 = modelInterestsLvl0.transform(testInterestsLvl0)
evaluatorInterestsLvl0 = RegressionEvaluator(metricName="rmse", labelCol="rank",
                                predictionCol="prediction")
rmseInterestsLvl0 = evaluatorInterestsLvl0.evaluate(predictionsInterestsLvl0)
print("Root-mean-square error = " + str(rmseInterestsLvl0))

#save level0 recommendations

recommendationsInterestsLvl0 = modelInterestsLvl0.recommendForAllUsers(3)
lvl0recs = recommendationsInterestsLvl0.withColumn('recommendations', explode('recommendations'))
resultLvl0 = lvl0recs.select("userId", lvl0recs["recommendations.lvl0id"].alias("categoryId"), lvl0recs["recommendations.rating"].alias("rank")) \
        .withColumn("createdAt",to_timestamp(current_timestamp(),"MM-dd-yyyy HH mm ss SSS"))
print(resultLvl0.count())
resultLvl0.write.jdbc(url=dbUrl, table='public."Recommendations"', mode="overwrite", properties=dbProperties)

#save level3 recommendations
recommendationsInterestsLvl3 = modelInterestsLvl3.recommendForAllUsers(200)
lvl3recs = recommendationsInterestsLvl3.withColumn('recommendations', explode('recommendations'))
resultLvl3 = lvl3recs.select("userId", lvl3recs["recommendations.lvl3id"].alias("categoryId"), lvl3recs["recommendations.rating"].alias("rank")) \
        .withColumn("createdAt",to_timestamp(current_timestamp(),"MM-dd-yyyy HH mm ss SSS"))
print(resultLvl3.count())
resultLvl3.write.jdbc(url=dbUrl, table='public."Recommendations"', mode="append", properties=dbProperties)
print("recommendations done and stored")
spark.stop()
print("--- %s seconds ---" % (time.time() - start_time))
