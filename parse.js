const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const he = require('he');
const app = express();

app.get('/parse', async (req, res) => {

    res.set('Cache-Control', 'no-store')

    let data_urlslasher=function(t,r=!1){return"/"==(t=t.replace(/\/?$/,"")).substr(-1)?t=data_urlslasher(t,r):r&&(t+="/"),t}

    let window_all_DONE = false;
    let failed_request = 0;
    let return_str = '';
    let return_status = 0;
    let window_all_DONE_req1 = false;
    let window_all_DONE_req2 = false;

    let allowed_retry = 3;

    let no_of_retry_req1 = 0;
    let no_of_retry_req2 = 0;

    let start_rows = 0
    let end_rows = 0

    let station_checker = 0
    let list_add_cursor = 0

    let staion_id_ary = [];
    let final_data = [];

    let todayDate = formatDate(new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
        hour12: false
    })).split(' ')[0];

    function formatDate(date) {
      var date_format = date.split(', ')
      var inputs_dates=date_format[0].split('/');
      if (typeof date_format[1] == 'undefined') {date_format[1] = '00:00:00';}
      return (
        [
          inputs_dates[2],
          padTo2Digits(inputs_dates[0]),
          padTo2Digits(inputs_dates[1]),
        ].join('-') +
        ' ' +
        date_format[1]
      ).replace(' 24:',' 00:');
    }
    function padTo2Digits(num) {
      return num.toString().padStart(2, '0');
    }
    // var todayDate

    function tConvert (time) {
      // Check correct time format and split into components
      time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

      if (time.length > 1) { // If time format correct
        time = time.slice (1);  // Remove full string match value
        time[5] = +time[0] < 12 ? 'am' : 'pm'; // Set AM/PM
        time[0] = +time[0] % 12 || 12; // Adjust hours
      }
      return time.join (''); // return adjusted time or original string
    }


    let allowed_pages = 5;
    

    if (req.query.pages)
     allowed_pages = req.query.pages;


    let parsed_address = decodeURI(req.query.address);

    console.log('Scraping address: '+parsed_address);


    for (let i = 0;true;i++) {

      // console.log('Request no: ',i)

      if(window_all_DONE_req1 && window_all_DONE_req2){break;}


          if (!window_all_DONE_req1) {
            await new Promise(function(resolve, reject) {


                console.log('scraping '+parsed_address+' page '+(list_add_cursor+1));

                var formData = {"operationName":"LocationBySearchTerm","variables":{"fuel":1,"search":parsed_address,"cursor": ''+(list_add_cursor*20) },"query":"query LocationBySearchTerm($brandId: Int, $cursor: String, $fuel: Int, $lat: Float, $lng: Float, $maxAge: Int, $search: String) {\n  locationBySearchTerm(lat: $lat, lng: $lng, search: $search) {\n    countryCode\n    displayName\n    latitude\n    longitude\n    regionCode\n    stations(brandId: $brandId, cursor: $cursor, fuel: $fuel, maxAge: $maxAge) {\n      count\n      cursor {\n        next\n        __typename\n      }\n      results {\n        address {\n          country\n          line1\n          line2\n          locality\n          postalCode\n          region\n          __typename\n        }\n        badges {\n          badgeId\n          callToAction\n          campaignId\n          clickTrackingUrl\n          description\n          detailsImageUrl\n          detailsImpressionTrackingUrls\n          imageUrl\n          impressionTrackingUrls\n          targetUrl\n          title\n          __typename\n        }\n        brandings {\n          brand_id\n          branding_type\n          __typename\n        }\n        brands {\n          brand_id\n          image_url\n          name\n          __typename\n        }\n        emergency_status {\n          has_diesel {\n            nick_name\n            report_status\n            update_date\n            __typename\n          }\n          has_gas {\n            nick_name\n            report_status\n            update_date\n            __typename\n          }\n          has_power {\n            nick_name\n            report_status\n            update_date\n            __typename\n          }\n          __typename\n        }\n        enterprise\n        fuels\n        id\n        name\n        offers {\n          discounts {\n            grades\n            highlight\n            pwgbDiscount\n            receiptDiscount\n            __typename\n          }\n          highlight\n          id\n          types\n          use\n          __typename\n        }\n        pay_status {\n          is_pay_available\n          __typename\n        }\n        prices {\n          cash {\n            nickname\n            posted_time\n            price\n            __typename\n          }\n          credit {\n            nickname\n            posted_time\n            price\n            __typename\n          }\n          discount\n          fuel_product\n          __typename\n        }\n        priceUnit\n        ratings_count\n        star_rating\n        __typename\n      }\n      __typename\n    }\n    trends {\n      areaName\n      country\n      today\n      todayLow\n      trend\n      __typename\n    }\n    __typename\n  }\n}\n"}

                let data_main_parse = request({
                    'url': 'https://www.gasbuddy.com/graphql',
                    'method': "POST",
                    'headers': {
                                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                                "accept-language": "en-US,en;q=0.9",
                                "content-type": "application/json",
                                "sec-fetch-dest": "document",
                                "sec-fetch-mode": "navigate",
                                "sec-fetch-site": "none",
                                "sec-fetch-user": "?1",
                                "upgrade-insecure-requests": "1",
                                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4342.0 Safari/537.36",
                             },
                    'body': JSON.stringify(formData)


                }, function(error, response, body) {


                    if (!error && response.statusCode == 200) {
                    // if (typeof response != 'undefined' && ((!error && response.statusCode == 200) || (!error && response.statusCode == 404) || (!error && response.statusCode == 400))) {

                        no_of_retry_req1 = 0;
                        request_completed = true;
                        if (error) {
                            console.log('response1 error!', error, body)
                            error = '' + error
                        }



                        if (typeof body == 'string' && body != '') {
                            let pagehtml = '';
                            pagehtml = body;



                            
                            try{


                              let json_response = JSON.parse(body)

                              // if (true) {
                              //   console.log('Station Id length'+dom_nodes('div[class*="GenericStationListItem-module__station___"]').length)
                              // }

                              // dom_nodes('div[class*="GenericStationListItem-module__station___"]:first').remove();
                              // let staion_id = dom_nodes('div[class*="GenericStationListItem-module__station___"]:first').attr('id');
                              // console.log("Station Id: " + staion_id);

                              let staion_ids = json_response['data']['locationBySearchTerm']['stations']['results'];

                              // console.log(staion_ids)

                              for (let is = 0; is < staion_ids.length; is++) {

                                staion_id_ary.push(staion_ids[is]['id'])
                              }

                              // console.log('Page: '+ i + ' -> Final Data: ' + final_data.length);
                              if (staion_ids.length == 0 || (list_add_cursor+2) > allowed_pages) {
                                window_all_DONE_req1 = true;

                                console.log('\nTotal stations: '+staion_id_ary.length+"\n")
                              }else{
                                list_add_cursor++;
                              }

                            }
                            catch(error){
                                window_all_DONE_req1 = true;
                                return_str = "It looks like scraper has an error!"+"\n<br>"+error;
                                return_status = 500;
                                resolve();
                            }


                        } else {
                            console.log('retrying 1....' + i)
                            request_completed = false;
                            data_main_parse.abort();
                            resolve();

                        }
                        resolve('');
                    } else {
                        if (no_of_retry_req1<allowed_retry) {

                            no_of_retry_req1++;

                            console.log('retrying 2....' + i)
                            request_completed = false;
                            data_main_parse.abort();
                            resolve();

                        }else{

                                window_all_DONE_req1 = true;
                                window_all_DONE_req2 = true;
                                return_str = "It looks like scraper has an error!"+"\n<br>"+error;
                                return_status = 500;
                                resolve();
                        }
                    }
                }).on('error', function(err) {
                    if (err.code === 'ETIMEDOUT') {

                        if (request_completed == false) {
                            console.log('retrying 3....' + i)
                            request_completed = false;
                            data_main_parse.abort();
                            resolve();
                        }
                    }
                });

            });


            }
            else if(!window_all_DONE_req2){

              await new Promise(function(resolve, reject) {

                        if (station_checker < staion_id_ary.length) { // && station_checker<3
                                        
                                        staion_id = staion_id_ary[station_checker];

                                        console.log('getting..',staion_id);
                                        let sub_parse = request({
                                          'url':'https://www.gasbuddy.com/station/'+ staion_id,
                                          // 'url':'https://www.gasbuddy.com/station/123457',
                                          'method': "GET",
                                          'headers': {
                                                      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                                                      "accept-language": "en-US,en;q=0.9",
                                                      "sec-fetch-dest": "document",
                                                      "sec-fetch-mode": "navigate",
                                                      "sec-fetch-site": "none",
                                                      "sec-fetch-user": "?1",
                                                      "upgrade-insecure-requests": "1",
                                                      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4342.0 Safari/537.36",
                                                   },
                                        }, function(sub_error, sub_response, sub_body) {

                                            if (typeof sub_body == 'string' && sub_body != '') {
                                                let sub_pagehtml = '';
                                                sub_pagehtml = sub_body;

                                                let sub_dom_nodes = cheerio.load(sub_pagehtml, null, false);
                                                
                                                
                                              try{

                                                  let jsonstart = sub_pagehtml.split('window.__APOLLO_STATE__ = ')[1];
                                                  let jsonEnd = jsonstart.split(';\n')[0];
                                                  let jsonData = JSON.parse(jsonEnd);
                                                  
                                                  if (typeof jsonData == 'object' && typeof jsonData != 'undefined' && JSON.stringify(jsonData) != '' && typeof jsonData['Station:'+staion_id] != 'undefined') {

                                                    no_of_retry_req2 = 0
                                                    let json_data = jsonData['Station:'+staion_id];

                                                    let to_be_push={};
                                                    to_be_push['station']= {}
                                                    to_be_push['station']['station_id'] = "";
                                                    to_be_push['station']['station_name'] = "";
                                                    to_be_push['station']['address'] = "";
                                                    to_be_push['station']['phone_number'] = "";
                                                    to_be_push['station']['verified'] = false;
                                                    to_be_push['station']['open_hours']= null
                                                    to_be_push['station']['prices']= {}
                                                    to_be_push['station']['prices']['diesel']= {}
                                                    to_be_push['station']['prices']['diesel']['cash_last_reported'] = "";
                                                    to_be_push['station']['prices']['diesel']['cash_price'] = "";
                                                    to_be_push['station']['prices']['diesel']['credit_last_reported'] = "";
                                                    to_be_push['station']['prices']['diesel']['credit_price'] = "";
                                                    to_be_push['station']['prices']['midgrade']= {}
                                                    to_be_push['station']['prices']['midgrade']['cash_last_reported'] = "";
                                                    to_be_push['station']['prices']['midgrade']['cash_price'] = "";
                                                    to_be_push['station']['prices']['midgrade']['credit_last_reported'] = "";
                                                    to_be_push['station']['prices']['midgrade']['credit_price'] = "";
                                                    to_be_push['station']['prices']['premium']= {}
                                                    to_be_push['station']['prices']['premium']['cash_last_reported'] = "";
                                                    to_be_push['station']['prices']['premium']['cash_price'] = "";
                                                    to_be_push['station']['prices']['premium']['credit_last_reported'] = "";
                                                    to_be_push['station']['prices']['premium']['credit_price'] = "";
                                                    to_be_push['station']['prices']['regular']= {}
                                                    to_be_push['station']['prices']['regular']['cash_last_reported'] = "";
                                                    to_be_push['station']['prices']['regular']['cash_price'] = "";
                                                    to_be_push['station']['prices']['regular']['credit_last_reported'] = "";
                                                    to_be_push['station']['prices']['regular']['credit_price'] = "";
                                                    



                                                    to_be_push['station']['station_id'] =staion_id; 
                                                    to_be_push['station']['station_name'] = json_data['name'];

                                                      let addres = [];
                                                      for (let add_ele in json_data['address']) {
                                                        if (json_data['address'][add_ele] != "" && add_ele != "country" && add_ele != "__typename") 
                                                          addres.push(json_data['address'][add_ele]);
                                                      }
                                                      
                                                      if (json_data['address']['country'] != 'undefined') {
                                                        addres.push(json_data['address']['country'])
                                                      }
                                                    to_be_push['station']['address'] = addres.join(', ');

                                                    to_be_push['station']['phone_number'] = json_data['phone'];

                                                    if (sub_dom_nodes('div[class*="StationInfoBox-module__mainInfo"] img[alt*="This station is verified!"]').length) {
                                                      to_be_push['station']['verified'] = true;
                                                    }

                                                    if (json_data['hours'] != null ) {

                                                          // console.log('hours_listhours_listhours_listhours_listhours_listhours_listhours_list');

                                                      if (typeof json_data['hours']['opening_hours'] != 'undefined' && json_data['hours']['opening_hours'] != '24/7' && json_data['hours']['opening_hours'] != "") {
                                                          let hours_list = json_data['hours']['opening_hours'].split(',')
                                                          if (hours_list.length) {
                                                            to_be_push['station']['open_hours']={}
                                                          }
                                                          hours_list.forEach(function(ele, index) {
                                                            let ele_str = '';
                                                            let st_time = '';
                                                            let end_time = '';
                                                            if (ele.includes('Mo ')){
                                                              ele_str = ele.replace('Mo ','');
                                                              st_time = ele_str.split('-')[0]
                                                              end_time = ele_str.split('-')[1]
                                                              to_be_push['station']['open_hours']['Monday'] =  tConvert(st_time) + '-' + tConvert(end_time)
                                                            }
                                                            if (ele.includes('Tu ')){
                                                              ele_str = ele.replace('Tu ','');
                                                              st_time = ele_str.split('-')[0]
                                                              end_time = ele_str.split('-')[1]
                                                              to_be_push['station']['open_hours']['Tuesday'] =  tConvert(st_time) + '-' + tConvert(end_time)
                                                            }
                                                            if (ele.includes('We ')){
                                                              ele_str = ele.replace('We ','');
                                                              st_time = ele_str.split('-')[0]
                                                              end_time = ele_str.split('-')[1]
                                                              to_be_push['station']['open_hours']['Wednesday'] =  tConvert(st_time) + '-' + tConvert(end_time)
                                                            }
                                                            if (ele.includes('Th ')){
                                                              ele_str = ele.replace('Th ','');
                                                              st_time = ele_str.split('-')[0]
                                                              end_time = ele_str.split('-')[1]
                                                              to_be_push['station']['open_hours']['Thursday'] =  tConvert(st_time) + '-' + tConvert(end_time)
                                                            }
                                                            if (ele.includes('Fr ')){
                                                              ele_str = ele.replace('Fr ','');
                                                              st_time = ele_str.split('-')[0]
                                                              end_time = ele_str.split('-')[1]
                                                              to_be_push['station']['open_hours']['Friday'] =  tConvert(st_time) + '-' + tConvert(end_time)
                                                            }
                                                            if (ele.includes('Sa ')){
                                                              ele_str = ele.replace('Sa ','');
                                                              st_time = ele_str.split('-')[0]
                                                              end_time = ele_str.split('-')[1]
                                                              to_be_push['station']['open_hours']['Saturday'] =  tConvert(st_time) + '-' + tConvert(end_time)
                                                            }
                                                            if (ele.includes('Su ')){
                                                              ele_str = ele.replace('Su ','');
                                                              st_time = ele_str.split('-')[0]
                                                              end_time = ele_str.split('-')[1]
                                                              to_be_push['station']['open_hours']['Sunday'] =  tConvert(st_time) + '-' + tConvert(end_time)
                                                            }
                                                        })
                                                      }
                                                      else if(json_data['hours']['opening_hours'] == '24/7' && json_data['hours']['opening_hours'] != ""){
                                                        to_be_push['station']['open_hours'] = '24/7';
                                                      }
                                                        

                                                    }
                                                    // if (true) {}


                                                    if (typeof json_data['prices'] != 'undefined') {
                                                      let gas_type = '';
                                                      json_data['prices'].forEach(function(ele, index) {
                                                                gas_type = ele['fuel_product'].replace('_gas','');

                                                            if ( gas_type == 'midgrade' || gas_type == 'regular' || gas_type == 'premium' || gas_type == 'diesel' ) {
                                                                let time_str = '';
                                                                let time_time = '';
                                                              if (ele['cash'] != null) {
                                                                  if (ele['cash']['posted_time'] != null){
                                                                    let time_str = ele['cash']['posted_time'].split('T')[0];
                                                                    let time_time = ele['cash']['posted_time'].split('T')[1].split('.')[0];
                                                                    to_be_push['station']['prices'][gas_type]['cash_last_reported'] = time_str + ' ' +time_time;
                                                                  }
                                                                
                                                                    to_be_push['station']['prices'][gas_type]['cash_price'] = ele['cash']['price'];
                                                              }
                                                              if (ele['credit'] != null) {
                                                                if (ele['credit']['posted_time'] != null){
                                                                  let time_str = ele['credit']['posted_time'].split('T')[0];
                                                                  let time_time = ele['credit']['posted_time'].split('T')[1].split('.')[0];
                                                                  to_be_push['station']['prices'][gas_type]['credit_last_reported'] = time_str + ' ' +time_time;
                                                                }

                                                                to_be_push['station']['prices'][gas_type]['credit_price'] = ele['credit']['price'];
                                                              }

                                                            }
                                                      })
                                                    }

                                                   


                                             

                                                  final_data.push(to_be_push);
                                                  station_checker++;
                                                  resolve();
                                                }
                                                else{
                                                        if (no_of_retry_req2<allowed_retry) {

                                                            no_of_retry_req2++;

                                                            console.log('retrying 2....' + i)
                                                            request_completed = false;
                                                            data_main_parse.abort();
                                                            resolve();

                                                        }else{
                                                            station_checker++;
                                                        }
                                                }

                                              }
                                              catch(error){
                                                  window_all_DONE_req1 = true;

                                                  station_checker++;
                                                  resolve();
                                              }

                                            } else {
                                                console.log('retrying_sub 1....')
                                                request_completed = false;
                                                sub_parse.abort();
                                                resolve();

                                            }




                                        });

                              
                                }else{
                                  window_all_DONE_req2=true;
                                    console.log('All Done!')
                                    request_completed = true;
                                    return_status = 200;
                                    resolve();
                                }
            });
            }
            if(window_all_DONE_req1 && window_all_DONE_req2){break;}
        }


          // let jsonstr = JSON.stringify(final_data);
          // await fs.writeFileSync('exports/'+todayDate+'.json', jsonstr);
          // console.log("\n\n"+'Success! File Exported to: '+'exports/'+todayDate+'.json'+"\n\n");


    if (return_status == 200) {
        res.status(200).json(final_data)
    } else if (return_status == 500) {
        res.send(return_str);
    } else {
        res.status(500).send('Error: Unable to parse website');
    }


});

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
