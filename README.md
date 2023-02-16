# gasbuddy-api

Prerequisites: npm, node

Run the project:

1. `npm install`
2. `node parse.js`

Utilize the parser:

http://localhost:3000/parse?address={address+city+state+zip}&pages=n

1 Infinite Loop, Cupertino, CA 95014 would be formatted as: "1+infinite+loop+cupertino+ca+95014".

A result will be json response with all stations objects array.
