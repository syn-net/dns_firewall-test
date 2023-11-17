const https = require('https')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const {Resolver} = require('dns');
const resolver = new Resolver();
const assert = require('assert')

const dnsServersList = [
  `192.168.12.15`, // ns3.home
  `192.168.12.16` // ns4.home
];
resolver.setServers(dnsServersList);

console.info(resolver.getServers());

assert(dnsServersList.length >= 1);
assert(resolver.getServers().length >= 2);
assert(resolver.getServers()[0], dnsServersList[0] || dnsServersList[1]);
assert(resolver.getServers()[1], dnsServersList[0] || dnsServersList[1]);

function center(s, max, c) {
	return s
		.padStart(s.length + Math.floor((max - s.length) / 2), c)
		.padEnd(max, c)
}
const header = (entries, date, comment) => {
	let ext = comment == '#' ? '.txt' : '.adblock'
	return (
		comment +
		' Title: d3Host List by d3ward\n' +
		comment +
		' Expires: 1 days\n' +
		comment +
		' Description: Simple and small list with the most popular advertising, tracking, analytics and social advertising services\n' +
		comment +
		' Homepage: https://github.com/d3ward/toolz\n' +
		comment +
		' License: CC BY-NC-SA\n' +
		comment +
		' Source: https://github.com/d3ward/toolz/blob/master/src/d3host' +
		ext +
		'\n\n' +
		comment +
		' This list cover all the tests on https://d3ward.github.io/toolz/adblock\n' +
		comment +
		' Type : Stable\n' +
		comment +
		' Entries : ' +
		entries +
		'\n' +
		comment +
		' Updated On: ' +
		date +
		'\n' +
		comment +
		' Created by: d3ward'
	)
}

const DEFAULT_RESOLVE_OPTIONS = {
};

// FIXME(jeff): This is still quite stubby; finish fleshing out the logic!
//
// https://nodejs.org/api/dns.html#
/*async*/
function resolve(host, options = DEFAULT_RESOLVE_OPTIONS) {
  resolver.resolve4(host, options, (err, addresses) => {
    const errMessage = new Error(err);

    if(err) {
      console.log(errMessage.message);
    } else {
      errMessage.code = 200;
      /* no error */
    }
    return errMessage;

    //console.info(addresses);
  });
}

function test(obj, comment, pre, post) {
	Object.keys(obj).forEach((category) => {
		let value = obj[category]
		Object.keys(value).forEach((key) => {
			let value2 = value[key]
			if (value2)
				value2.forEach((v) => {
          resolve(v);
          /*https
						.get('https://' + v, (res) => {
							if (res.statusCode >= 200 && res.statusCode < 300)
								console.log(
									chalk.green(`${v}: ${res.statusCode}`)
								)
							else if (
								res.statusCode >= 300 &&
								res.statusCode < 400
							)
								console.log(
									chalk.blue(`${v}: ${res.statusCode}`)
								)
							else if (res.statusCode == 404)
								console.log(
									chalk.red(`${v}: ${res.statusCode}`)
								)
							else
								console.log(
									chalk.magenta(`${v}: ${res.statusCode}`)
								)
						})
						.on('error', (error) => {
							console.error(`${v}: ${error.message}`)
						})*/
				})
		})
	})
}
function build(obj, comment, pre, post) {
	let txt = ''
	let entries = 0
	Object.keys(obj).forEach((category) => {
		let value = obj[category]
		txt += '\n\n' + comment + center(' ' + category + ' ', 30, '=') + '\n'
		Object.keys(value).forEach((key) => {
			let value2 = value[key]
			txt += '\n' + comment + ' --- ' + key + '\n'
			if (value2)
				value2.forEach((v) => {
					entries++
					txt += pre + v + post + '\n'
				})
		})
	})
	const date = new Date()
	const d =
		date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear()
	return header(entries, d, comment) + txt
}
function write(output, input) {
	fs.writeFile(output, input, { encoding: 'utf8' }, function (err) {
		if (err) {
			return console.error(err)
		}
		fs.readFile(output, function (err, data) {
			if (err) {
				return console.error(err)
			}
			console.log('Created \n' + output)
		})
	})
}
fs.readFile(
	path.resolve(__dirname, '../data/adblock_data.json'),
	'utf8',
	(err, jsonString) => {
		if (err) {
			console.log('Error reading file from disk:', err)
			return
		}
		try {
			const obj = JSON.parse(jsonString)
			test(obj)
			write(
				path.resolve(__dirname, '../d3host.txt'),
				build(obj, '#', '0.0.0.0 ', '')
			)
			write(
				path.resolve(__dirname, '../d3host.adblock'),
				build(obj, '!', '||', '^')
			)
		} catch (err) {
			console.log('Error parsing JSON string:', err)
		}
	}
)
