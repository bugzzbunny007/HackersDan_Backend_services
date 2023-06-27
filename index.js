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
