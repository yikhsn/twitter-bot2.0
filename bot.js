const config = require('./config');
const axios = require('axios');
const Twit = require('twit');
const { BitlyClient } = require('bitly');
const bitly = new BitlyClient('c236f5eb2ace182337cbff0eda2521386428d042', {});

const T = new Twit(config);

const onAuthenticated = (err, res) => {
  if (err) throw err;

  console.log('Authentication successful. Running bot...\r\n');
};

T.get('account/verify_credentials', {
  include_entities: false,
  skip_status: true,
  include_email: false
}, onAuthenticated);

const tweetIt = (status) => {
  T.post( 'statuses/update', { 
    status: status
  }, (err, data, response) => {
    if (response) {
      console.log(`Tweeted`);
    }
    if (err){
      console.log(err, data);
    }
  });
};

const getData = async (id) => {
  const res = await axios(`https://www.alquranid.com/api/ayat/${id}`);    
  
  return res.data;
};

const getAyat = (data) => {
  const resAyat =`${data.terjemahan_idn}`;
  const resAttAyat = `(${data.surat.nama_surat}:${data.nomor_ayat})`;
  
	// replace the double quote and backtick in quran verse with single quote
	const ayat = resAyat.replace(/"/g, "'").replace(/`/g, "'");
	const attAyat = resAttAyat.replace(/"/g, "'").replace(/`/g, "'");
  
  return '"' + ayat + '"' + ' ' + attAyat;
};

const getLink = async(data) => {
  let linkData;

  const linkSurat = `https://www.alquranid.com/surat/${data.surat.nomor_surat}`;
  try {
    linkData = await bitly.shorten(linkSurat);
  } catch (error) {
    console.log(error);
  }

  return linkData.url;
}

const getTweet = async() => {
  const ran = Math.floor(Math.random() * (6223 - 1 + 1)) + 1;

  const data = await getData(ran);

  let link = await getLink(data);

  let ayat = await getAyat(data);

  let tweet = {
    ayat: ayat,
    link: link 
  }

  if (ayat.length > 230) {

    console.log('ayat terlalu panjang, coba lagi');

    tweet = await getTweet();

  }

  return tweet;
}

const controlTweet = async() => {
  
  const data = await getTweet();

  const tweet = data.ayat + ' ' + data.link;
  
  tweetIt(tweet);  
};

setInterval(controlTweet, 1800000);