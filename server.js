'use strict';
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const axios = require('axios');
const fetch = require('node-fetch');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({limit: '50mb'}));

app.get('/', (req, res) => {
    res.send("Express heroku app");
});

app.get('/server', (req, res) => {
    const orderData = [];
    req.query.orderId.split(',').forEach(async(el)=>{
        await axios.get(`https://api.bigcommerce.com/stores/u2ycf4bje7/v2/orders/${el}`, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Auth-Token': '2ke7xq3ont3z9gjx7v86dhciha7iis9'
            }
        })
        .then(async(res)=> {
            await orderData.push(res.data);
            return orderData;
        })
    })
     
    axios.get(`https://api.bigcommerce.com/stores/u2ycf4bje7/v2/customers/${req.query.id}`, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Auth-Token': '2ke7xq3ont3z9gjx7v86dhciha7iis9'
        }
    }).then(resp => {
        //const orderData = [];
        axios.get(`${resp.data.addresses.url}`, {
        headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Auth-Token': '2ke7xq3ont3z9gjx7v86dhciha7iis9'
            }
        }).then((data)=> {
            //console.log('orderData', orderData);
            res.send(Object.assign({}, data.data, resp.data, {orderMessage:{orderData}}));
        })
    });
});

app.post('/addressUpdate', cors(), async(req, res) => {
    console.log('hello', req.body.form);
     
    const response = await fetch('https://api.bigcommerce.com/stores/u2ycf4bje7/v3/customers/addresses', {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Auth-Token': '2ke7xq3ont3z9gjx7v86dhciha7iis9'
        },
        body: JSON.stringify([{ 
            "first_name": `${req.body.form.firstname}`,
            "last_name": `${req.body.form.lastname}`,
            "address1": `${req.body.form.street_1}`,
            "address2": `${req.body.form.street_2}`,
            "city": `${req.body.form.city}`,
            "phone": `${req.body.form.phone}`,
            "id": req.body.form.id,
            "customer_id": req.body.form.customer_id
        }])
    });
    const data = await response.json();
    console.log(data);    
})

// start the Express server
app.listen(process.env.PORT || 8080, () => {
    console.log('Server started at');
    //logger.info('Server started at');
});