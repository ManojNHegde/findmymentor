#!/bin/bash
(code .)&
(cd client && npm start) &
(cd server && nodemon server.js)
