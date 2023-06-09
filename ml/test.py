#!/bin/python3

import requests
import psycopg2
import time
import json

conn = None
cur = None

test_path = 'test.csv'
test_out_path = 'test.csv'



def get_rec( id ):

	#req = "--location --request POST 'https://leaders.hpclab.ru/api/search' --header 'Content-Type: application/json' --data-raw '{ \"userId\": {"+str(id)+"} }'"

	url = 'https://leaders.hpclab.ru/api/search'
	headers = { 'Content-Type': 'application/json' }
	data = json.dumps({
		"userId": id,
		"future": True
	})
	#print(data)
	r = requests.post( url, data=data, headers=headers )

	if r.status_code != 200:
		print(r.status_code)
		return None

	j = r.json()

	#print( j )

	return j


def map_id( id ):

	global conn
	global cur

	sql = """SELECT "id" FROM "User" WHERE "externalId"=%s LIMIT 1;"""

	try:

		cur.execute( sql, ( int(id), ) )
		res = cur.fetchone()

		if res == None:
			return None
		else:
			return res[0]


	except (Exception, psycopg2.DatabaseError) as error:
		print(error)
		exit(0)


def main():

	global conn
	global cur

	try:
		conn = psycopg2.connect( host='10.50.50.34', port=5432, dbname='leaders2023', user='postgres', password='m3zyCrSHpGXsgqn2XZGigP7hR4Dn2GaeEfJSTDmkfvADkEoPgVbp96nUL6Xty4PK' )
		cur = conn.cursor()
	except (Exception, psycopg2.DatabaseError) as error:
		print(error)
		exit(0)


	file = []

	try:
		f = open(test_path,'r')
	except:
		print('Cant open file ',test_path)
		exit(0)


	for i,s in enumerate(f):

		par = s.strip().split(',')

		file.append(par)

		if i==0:
			continue

		print(f'[{par[0]}] ',end='')

		if len(par) > 2:
			print('SKIP')
			continue

		eid = par[0]
		id = map_id( eid )

		if id == None:
			print('ID NOT FOUND')
			continue

		print(f'id={id} ',end='')

		j = get_rec(id)
		if j == None:
			print('JSON EMPTY')
			continue

		del par[1]

		for group in j['groups']:
			#print( group['externalId'] )
			par.append( str( group['externalId'] ) )

		print('DONE')

		time.sleep(0.2)


	f.close()



	try:
		f = open(test_out_path,'w')
	except:
		print('Cant open file ',test_out_path)
		exit(0)

	for l in file:
		f.write( ','.join(l) + '\n' )

	f.close()

	cur.close()
	conn.close()


if __name__ == '__main__':
    main()
