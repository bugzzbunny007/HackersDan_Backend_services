const express = require('express');
const app = express();
const port = 3000;
// const schedule = require('node-schedule');
const cron = require('node-cron');
// Download the helper library from https://www.twilio.com/docs/node/install
const accountSid = "ACfa5ea1953a02c56c3d19ad1b835328df";
const authToken = "ee3ff043364dbf0b5a6d51222ca64ace";
const client = require("twilio")(accountSid, authToken);
const fs = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
fs.initializeApp({
 credential: fs.credential.cert(serviceAccount)
});
const db = fs.firestore(); 

//firebase crud end
const getUsers = async() => {
  // get document
  const liam = await db.collection('users').doc('alert').get();
  if (!liam.exists) {
    console.log('No document');
   } else {
    const alldata = liam.data().contacts
    alldata.map((a)=>{
      const entries = Object.entries(a);
      for (const [key, value] of entries) {
        // console.log('Key:', key);
        console.log('Value:', value[0]);
        for(const i of value){
          const date = i.toDate();
          const hour = date.getHours();
          const minute = date.getMinutes();
          console.log("Hour",hour);
          console.log("minute",minute);
          cron.schedule(`${minute} ${hour} * * *`, function() {
            // Place your job logic here
            console.log(`Job executed at the specified time. ${hour} => ${minute}`);
            try{
              // callme(key);
              sendmessage(key);
              whatsappmessage();
              
            }catch(err){
              console.log(err.message);
            }
          });
        }
      }
    })
   }
}

const callme = (number) => {
    client.calls.create({
        url: "http://demo.twilio.com/docs/voice.xml",
        to: `+91${number}`,
        from: "+14175386352",
      })
      .then(call => console.log(call.sid));
}

const sendmessage = (number) =>{
    client.messages
    .create({
        body: 'It is a reminder to you please take your medicines on Time regards,HackersDen',
        from: '+14175386352',
        to: `+91${number}`
    })

    .then(message => console.log(message.sid))
    .done();
}

const whatsappmessage = () => {
  try{
    client.messages
    .create({
        body: 'Please take your medicines on Time this is a timely reminder from team HackersDan',
        from: 'whatsapp:+14155238886',
        to: 'whatsapp:+919406928294'
    })
    .then(message => console.log(message.sid))
    .done();
  }catch(err){
    console.log(err.message);
  }
}

app.get('/', async(req, res) => {
  await getUsers();
  res.send('Hello World!');
  // schedule.scheduleJob('* * * * *', () =>{
  //   console.log("It is running everyminute");
  //   // sendmessage();
  //   try{
  //       // callme();
  //       // sendmessage();
  //       console.log("try")
  //   }catch(err){
  //       console.log(err.message);
  //   }
  // })
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
  // Create a cron-style time pattern for 4:30 PM every day

  whatsappmessage();
});









const request = require('supertest');
const express = require('express');
const app = express();
const apiRoutes = require('../routes/apiRoutes');

app.use(express.json());
app.use('/api', apiRoutes);

describe('GET /api/AffiliateGroupContributor', () => {
    it('should return 400 if EffectiveDate is missing', async () => {
        const res = await request(app).get('/api/AffiliateGroupContributor');
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('EffectiveDate is required');
    });

    it('should return 400 if neither affiliateGroupLegalEntityID nor contributorLegalEntityID is provided', async () => {
        const res = await request(app)
            .get('/api/AffiliateGroupContributor')
            .query({ EffectiveDate: '2024-07-15' });
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('Either affiliateGroupLegalEntityID or contributorLegalEntityID is required');
    });

    it('should call fetchDataByAffiliateGroup when affiliateGroupLegalEntityID is provided', async () => {
        const fetchDataByAffiliateGroup = jest.spyOn(require('../services/affiliateGroupContributorService'), 'fetchDataByAffiliateGroup');
        fetchDataByAffiliateGroup.mockResolvedValue({ data: 'mockData' });

        const res = await request(app)
            .get('/api/AffiliateGroupContributor')
            .query({ affiliateGroupLegalEntityID: 1, EffectiveDate: '2024-07-15' });
        
        expect(fetchDataByAffiliateGroup).toHaveBeenCalledWith(1, '2024-07-15');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ data: 'mockData' });

        fetchDataByAffiliateGroup.mockRestore();
    });

    it('should call fetchDataByContributor when contributorLegalEntityID is provided', async () => {
        const fetchDataByContributor = jest.spyOn(require('../services/affiliateGroupContributorService'), 'fetchDataByContributor');
        fetchDataByContributor.mockResolvedValue({ data: 'mockData' });

        const res = await request(app)
            .get('/api/AffiliateGroupContributor')
            .query({ contributorLegalEntityID: 1, EffectiveDate: '2024-07-15' });

        expect(fetchDataByContributor).toHaveBeenCalledWith(1, '2024-07-15');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ data: 'mockData' });

        fetchDataByContributor.mockRestore();
    });

    it('should return 500 if an error occurs', async () => {
        const fetchDataByAffiliateGroup = jest.spyOn(require('../services/affiliateGroupContributorService'), 'fetchDataByAffiliateGroup');
        fetchDataByAffiliateGroup.mockRejectedValue(new Error('Test error'));

        const res = await request(app)
            .get('/api/AffiliateGroupContributor')
            .query({ affiliateGroupLegalEntityID: 1, EffectiveDate: '2024-07-15' });

        expect(res.statusCode).toEqual(500);
        expect(res.body.message).toEqual('An error occurred');
        expect(res.body.error).toEqual('Test error');

        fetchDataByAffiliateGroup.mockRestore();
    });
});
