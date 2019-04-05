var mysql=require('mysql');
var express=require('express');
var app = express.Router();

var http = require('http');
var url = require('url');
var request = require('request');
var nodemailer=require('nodemailer');
var mergeJSON = require("merge-json");

var multipart = require('connect-multiparty');
var path = require('path');
var xml = require('xml');
var XLSX = require('xlsx');
var QRCode = require('qrcode');
var MailPattern=/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
var MobileNoPattern=/^([0|\+[0-9]{1,5})?([7-9][0-9]{9})$/;

var con = mysql.createConnection({
	host:'remotemysql.com',
	user : 'u7CqvMlRyu',
	password : 'NPQ4iY8lQX',
	database: 'u7CqvMlRyu',
	connectionLimit : 100,
	acquireTimeout : 15000,
	port: 3306
});	

var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
	  user: 'esmartpass@gmail.com',
	  pass: 'smartpass'
	}
  });



con.connect(function(err){
	if(err){
		throw err;
		return;
	}else{
		console.log("Connection Established.");
	}
});



// epasscheckuser

app.get("/epasscheckuser",function(req,res){
	
    var username=req.query.username;
	
    con.query("SELECT * FROM `profile` WHERE `userid`='"+username+"' OR mobileno='"+username+"' OR email='"+username+"'",function(err,result){
		
        if(err){
            throw err;
        }else if(result.length > 0){
			res.json({"StatusCode" : 200,"Message":"User Exists","Response":result});
            res.end();
        }else{
            res.json({"StatusCode" : 400,"Message":"User Doesn't Exists"});
            res.end();
        }
		
    });

});

// epasslogin

app.get("/epasslogin",function(req,res){
	
    var username=req.query.username;
    var password=req.query.password;
	
    con.query("SELECT * FROM `profile` WHERE (`userid`='"+username+"' OR mobileno='"+username+"' OR email='"+username+"') AND `password`='"+password+"'",function(err,result){
		
        if(err){
            throw err;
        }else if(result.length > 0){
			res.json({"StatusCode" : 200,"Message":"Login Success","Response":result});
            res.end();
        }else{
            res.json({"StatusCode" : 400,"Message":"Incorrect Details"});
            res.end();
        }
		
    });

});


//epassregister


app.post("/epassregister",function(req,res){
	var username=req.query.username||'';
	var email='';
	var mobileno='';
	var password=req.query.password || '';
    var role='Passenger';
	
	var name=req.query.name || '';
	var gender=req.query.gender || '';
	var dob=req.query.dob || '';
	var age=req.query.age || '';
	var profileimg=req.query.profileimg || '';
	var rights=req.query.rights || '';
	var prooftype=req.query.prooftype || '';
	var proofid=req.query.proofid || '';
	var designation=req.query.designation || '';
    var updateby=req.query.updateby || '';
	if(MailPattern.test(username)){
		email=username;
		con.query("SELECT * FROM `profile` WHERE email='"+email+"'",function(err,result){
			if(err){
				throw err;
			}else if(result.length === 0){
				
				con.query("INSERT INTO `profile`(`mobileno`, `password`, `role`, `email`, `name`, `gender`, `dob`, `age`, `profileimg`, `rights`, `prooftype`, `proofid`, `designation`,  `updateby`) VALUES('"+mobileno+"','"+password+"','"+role+"','"+email+"','"+name+"','"+gender+"','"+dob+"','"+age+"','"+profileimg+"','"+rights+"','"+prooftype+"','"+proofid+"','"+designation+"','"+updateby+"')",function(err,result){
					
					if(err){
						throw err;
					}else{
						res.json({"StatusCode" : 200,"Message":"User Registered Successfully","Response":result});
						res.end();
					}
					
				});
			}else{
				
				res.json({"StatusCode" : 400,"Message":"User Already Exist!!!","Response":result});
				res.end();
				
			}
		});
		
	}else if(MobileNoPattern.test(username)){
		mobileno=username;	
		con.query("SELECT * FROM `profile` WHERE mobileno='"+mobileno+"'",function(err,result){
			if(err){
				throw err;
			}else if(result.length === 0){
				
				con.query("INSERT INTO `profile`(`mobileno`, `password`, `role`, `email`, `name`, `gender`, `dob`, `age`, `profileimg`, `rights`, `prooftype`, `proofid`, `designation`,  `updateby`) VALUES('"+mobileno+"','"+password+"','"+role+"','"+email+"','"+name+"','"+gender+"','"+dob+"','"+age+"','"+profileimg+"','"+rights+"','"+prooftype+"','"+proofid+"','"+designation+"','"+updateby+"')",function(err,result){
					
					if(err){
						throw err;
					}else{
						res.json({"StatusCode" : 200,"Message":"User Registered Successfully","Response":result});
						res.end();
					}
					
				});
			}else{
				
				res.json({"StatusCode" : 400,"Message":"User Already Exist!!!"});
				res.end();
				
			}
		});
			
	}
   
	
});


//forgot password

app.post("/epassforgotpassword",function(req,res){
	
	
    var password=req.query.password;
    var username=req.query.username;
   	
	con.query("SELECT * FROM `profile` WHERE email='"+username+"' OR mobileno='"+username+"' OR userid='"+username+"'",function(err,result){
		if(err){
			throw err;
		}else if(result.length > 0){
			con.query("UPDATE `profile` SET `password`='"+password+"' WHERE `userid`='"+username+"' OR `mobileno`='"+username+"' OR `email`='"+username+"'",function(err,result){
				
				if(err){
					throw err;
									
				}else if(result){
					res.json({"StatusCode" : 200,"Message":"Password Changed Successfully","Response":result});
					res.end();
				}else{
					res.json({"StatusCode" : 400,"Message":"Password Changed Failed!!!"});
					res.end();	
				}
				
			});
		}else{
			
			res.json({"StatusCode" : 400,"Message":"User Doesn't Exists!!!"});
			res.end();
			
		}
	});
	
	
});


//update email in profile

app.post("/epassupdateemail",function(req,res){
	
	
    var email=req.query.email;
    var username=req.query.username;
   	
	con.query("SELECT * FROM `profile` WHERE email='"+email+"'",function(err,result){
		if(err){
			throw err;
		}else if(result.length === 0){
			con.query("UPDATE `profile` SET `email`='"+email+"' WHERE `userid`='"+username+"' OR `mobileno`='"+username+"'",function(err,result){
				
				if(err){
					throw err;
									
				}else if(result){
					res.json({"StatusCode" : 200,"Message":"Email Updated Successfully","Response":result});
					res.end();
				}else{
					res.json({"StatusCode" : 400,"Message":"Email Updated Failed!!!"});
					res.end();	
				}
				
			});
		}else{
			
			res.json({"StatusCode" : 400,"Message":"Email Already Exist!!!"});
			res.end();
			
		}
	});
	
	
});

//update userdetails in profile

app.post("/epassupdateuserinfo",function(req,res){
	
	
    var name=req.query.name;
    var gender=req.query.gender;
    var dob=req.query.dob;
    var age=req.query.age;
    var username=req.query.username;
   	
		con.query("UPDATE `profile` SET `name`='"+name+"',`gender`='"+gender+"',`dob`='"+dob+"',`age`='"+age+"' WHERE `userid`='"+username+"' OR `mobileno`='"+username+"'",function(err,result){
			
			if(err){
				throw err;
								
			}else if(result){
				res.json({"StatusCode" : 200,"Message":"User Details Updated Successfully","Response":result});
				res.end();
			}else{
				res.json({"StatusCode" : 400,"Message":"User Details Updated Failed!!!"});
				res.end();	
			}
			
		});

	
});




//profile image update


app.post("/epassprofileupload",function(req,res){
    
   
	var username=req.query.username;
	
    if(req.files != null ){
		
    var file = req.files.profileimg;
    
   
    var profileimg='./profile/'+username+'.png';
  
   
        file.mv('./profile/'+username+'.png',function(err) {
            if(err){
                throw err;  
            }else{
              
				
				 con.query("UPDATE `profile` SET `profileimg`='"+profileimg+"' WHERE `userid`='"+username+"' OR `mobileno`='"+username+"'",function(err,result){
					if(err){
						throw err;
					}
					else if(!result){
						
						res.json({"StatusCode" : 400,"Message":"Profile Image  Updated Failed"});
						res.end();
					}else{
						res.json({"StatusCode" : 200,"Message":"Profile Image Updated Succesfully","Response":result});
						res.end();
					}
					
				});
				
            }
        });
    }else{
        res.end("Please upload image");
    }
});

//update user proof details in profile

app.post("/epassupdateproofinfo",function(req,res){
	
	
    var prooftype=req.query.prooftype;
    var proofid=req.query.proofid;
    var username=req.query.username;
   	
		con.query("UPDATE `profile` SET `prooftype`='"+prooftype+"',`proofid`='"+proofid+"' WHERE `userid`='"+username+"' OR `mobileno`='"+username+"'",function(err,result){
			
			if(err){
				throw err;
								
			}else if(result){
				res.json({"StatusCode" : 200,"Message":"User Proof Details Updated Successfully","Response":result});
				res.end();
			}else{
				res.json({"StatusCode" : 400,"Message":"User Proof Details Updated Failed!!!"});
				res.end();	
			}
			
		});

	
});

//update designation in profile

app.post("/epassupdatedesignation",function(req,res){
	
	
    var designation=req.query.designation;
  
    var username=req.query.username;
   	
		con.query("UPDATE `profile` SET `designation`='"+designation+"' WHERE `userid`='"+username+"' OR `mobileno`='"+username+"'",function(err,result){
			
			if(err){
				throw err;
								
			}else if(result){
				res.json({"StatusCode" : 200,"Message":"User Designation Details Updated Successfully","Response":result});
				res.end();
			}else{
				res.json({"StatusCode" : 400,"Message":"User Designation Details Updated Failed!!!"});
				res.end();	
			}
			
		});

	
});


//update epassupdatetheme in profile

app.post("/epassupdatetheme",function(req,res){
	
	
    var theme=req.query.theme;
  
    var username=req.query.username;
   	
		con.query("UPDATE `profile` SET `theme`='"+theme+"' WHERE `userid`='"+username+"' OR `mobileno`='"+username+"' OR `email`='"+username+"'",function(err,result){
			
			if(err){
				throw err;
								
			}else if(result){
				res.json({"StatusCode" : 200,"Message":"Theme Changed Successfully","Response":result});
				res.end();
			}else{
				res.json({"StatusCode" : 400,"Message":"Theme Changed Failed!!!"});
				res.end();	
			}
			
		});

	
});

// OTP Send

app.get('/epassotpsend',function(req,res){
	var Mobileoremail=req.query.Mobileoremail;
	var OTP=Math.floor(1000 + Math.random() * 9000);
	con.query('SELECT * FROM `otplog` WHERE MobileNoorEmail="'+Mobileoremail+'" AND Validtill >= CURRENT_TIMESTAMP ORDER BY CreatedTime DESC LIMIT 1',function(err,result){
		if(err){
			throw err;
		}else if(result.length > 0 ){
			var msg=`Your otp is ${result[0].OTP}. Please do not share it with anybody.`;
			epassotpsendfunction(result[0].MobileNoorEmail,msg);
			res.json({StatusCode:res.statusCode,Message:"Success",Response:result});
		}else{
			con.query('INSERT INTO `otplog`( `MobileNoorEmail`, `OTP`, `Validtill` ) VALUES ("'+Mobileoremail+'",'+OTP+',CURRENT_TIMESTAMP + INTERVAL 180 MINUTE_SECOND)',function(err,result){
				if(err){
					throw err;
				}else{
					var msg=`Your otp is ${OTP}. Please do not share it with anybody.`;
					epassotpsendfunction(Mobileoremail,msg);
					res.json({StatusCode:res.statusCode,Message:"OTP Send Successfully",Response:result});
				}
			});
		}
	});
});

function epassotpsendfunction(MobileNo,Msg){
	
	if(MobileNoPattern.test(MobileNo)){
		request.get(`http://smsstreet.in/websms/sendsms.aspx?userid=prematix&password=matixpre&sender=PAYPRE&mobileno=${MobileNo}&msg=${Msg}`, (error, response, body) => {
		//request.get(`http://minesmsapi.000webhostapp.com/?uid=9791329930&pwd=9791329930&phone=${MobileNo}&msg=Your otp is ${OTP}. Please do not share it with anybody.`, (error, response, body) => {
			/* if(error) {
				throw  error;
			}else{
				//console.log({StatusCode:200,Message:"Message Sent successfully."});
			} */
			
		});
	}else if(MailPattern.test(MobileNo)){
		//console.log();
	  var mailOptions = {
		from: 'esmartpass@gmail.com',
		to: MobileNo,
		subject: 'E-SMART PASS',
		text: Msg,
	  };
	  transporter.sendMail(mailOptions, function(error, info){
		if (error) {
		  //console.log(error);
		} else {
		  //console.log({"StatusCode":200,"Message":info.response});
		}
	  });

	}else{
		//console.log('Invalid mail and mobile')
	}
	
}


app.post('/reqapp',function(req,res){
	
	var name=req.query.name;
	var mobile=req.query.mobile;
	var email=req.query.email;
	
	var message= "Request For E Smart Pass \nName : "+name+" \nMobile Number : "+mobile+" \nEmail Address : "+email+""
	
	epassotpsendfunction('esmartpass@gmail.com',message);
	res.json({StatusCode:200,Message:"Request Send Successfully"});
	res.end();
	
});





app.get('/epassotpvalidate' ,function(req,res){
	var Mobileoremail=req.query.Mobileoremail;
	var OTP=req.query.OTP;
	con.query('SELECT * FROM `otplog` WHERE MobileNoorEmail="'+Mobileoremail+'" AND Validtill >= CURRENT_TIMESTAMP ORDER BY CreatedTime DESC LIMIT 1',function(err,result){
		if(err){
			throw err;
		}else if(result.length > 0){
			if(+OTP === +result[0].OTP){
				res.json({StatusCode:200,Message:"OTP Verified successfully."});
			}else{
				res.json({StatusCode:400,Message:"Please Enter a Valid OTP."});
			}
		}else{
			res.json({StatusCode:400,Message:"OTP was Expired."});
		}
	});
});



app.get('/epassnotification',function(req,res){
	var Mobileoremail=req.query.Mobileoremail;
	var Msg=req.query.Msg;
	if(Mobileoremail !== ('' && null) && Msg !== ('' && null) ){
		OTPsendfunction(Mobileoremail,Msg);
		res.end('Success');
	}else{
		res.end('Failed');
	}

});







//epass user creation
app.post("/epassuserregister",function(req,res){
	
    var mobileno=req.query.mobileno || '';
    var password=req.query.password || '';
	var role=req.query.role || '';
    var email=req.query.email || '';
    var name=req.query.name || '';
    var rights=req.query.rights || '';
    var statecode=req.query.statecode || '';
    var statename=req.query.statename || '';
    var citycode=req.query.citycode || '';
    var cityname=req.query.cityname || '';
    var corporationcode=req.query.corporationcode || '';
    var corporationname=req.query.corporationname || '';
	var areaname=req.query.areaname || '';
	var areacode=req.query.areacode || '';
    var updateby=req.query.updateby || '';
   
    con.query("SELECT * FROM `profile` WHERE mobileno='"+mobileno+"' OR email='"+email+"'",function(err,result){
		if(err){
			throw err;
		}else if(result.length === 0){
			
			con.query("INSERT INTO `profile` ( `mobileno`, `password`, `role`, `email`, `name`,  `rights`,`statecode`, `statename`, `citycode`, `cityname`, `corporationcode`,`corporationname`, `areaname`,`areacode`,`updateby`) VALUES ('"+mobileno+"','"+password+"','"+role+"','"+email+"','"+name+"','"+rights+"','"+statecode+"','"+statename+"','"+citycode+"','"+cityname+"','"+corporationcode+"','"+corporationname+"','"+areaname+"','"+areacode+"','"+updateby+"')",function(err,result){
				
				if(err){
					throw err;
				}else if(result){
					if(role === 'Admin'){
						var message = '\n You have been allocated as a '+role+' For '+statename+' State. From now, you will have the corresponding responsibilities. \n \n \n  Your details are :-  \n \n Name :  '+name+' \n Mobile Number : '+mobileno+' \n Email Address : '+email+' \n Role: '+role+' \n State Name : '+statename+' \n User ID : '+result.insertId+'\n Password : epass123 \n\n \n \n ---------------------------We are Happy To Welcome You -----------------------------------';
					}else if(role === 'SubAdmin'){
						var message = '\n You have been allocated as a '+role+' For '+statename+' State. From now, you will have the corresponding responsibilities. \n \n \n  Your details are :-  \n \n Name :  '+name+' \n Mobile Number : '+mobileno+' \n Email Address : '+email+' \n Role: '+role+' \n State Name : '+statename+' \n Corporation Name : '+corporationname+' \n City Name : '+cityname+' \n User ID : '+result.insertId+'\n Password : epass123 \n\n \n \n ---------------------------We are Happy To Welcome You -----------------------------------';
					}
					else if(role === 'Counter'){
						var message = '\n You have been allocated as a '+role+' For '+statename+' State. From now, you will have the corresponding responsibilities. \n \n \n  Your details are :-  \n \n Name :  '+name+' \n Mobile Number : '+mobileno+' \n Email Address : '+email+' \n Role: '+role+' \n State Name : '+statename+' \n Corporation Name : '+corporationname+' \n City Name : '+cityname+' \n Area Name : '+areaname+' \n User ID : '+result.insertId+'\n Password : epass123 \n\n \n \n ---------------------------We are Happy To Welcome You -----------------------------------';
					}else{
						var message = '\n You have been allocated as a '+role+'. From now, you will have the corresponding responsibilities. \n \n \n  Your details are :-  \n \n Name :  '+name+' \n Mobile Number : '+mobileno+' \n Email Address : '+email+' \n Role: '+role+' \n User ID : '+result.insertId+'\n Password : epass123 \n\n \n \n ---------------------------We are Happy To Welcome You -----------------------------------';
					}
					epassotpsendfunction(email,message);
					epassotpsendfunction(mobileno,message);
					res.json({"StatusCode" : 200,"Message":"E Pass User Registered Successfully","Response":result});
					
					res.end();
				}else{
					res.json({"StatusCode" : 400,"Message":"E Pass User Registered Failed","Response":result});
					res.end();
				}
				
			});
		}else{
			
			res.json({"StatusCode" : 400,"Message":"Details Already Exist!!!"});
			res.end();
		}
	});
	
});



//statelist based on country

app.get('/statelistindia',function(req,res){
	
	con.query("SELECT `country`,`countryname`,`id`, `abbr`,`name` FROM `state` WHERE country='IN'",function(err,result){
		if(err){
			throw err;
		}else if(result!=0){
			res.json({"StatusCode" : 200,"Message":"State Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"State Details Doesn't Exists!!!"});
			res.end();
		}
	});
});

//citylist based on country

app.get('/citylistindia',function(req,res){
	
	con.query("SELECT `id`, `name`, `state` FROM `city`",function(err,result){
		if(err){
			throw err;
		}else if(result!=0){
			res.json({"StatusCode" : 200,"Message":"City Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"City Details Doesn't Exists!!!"});
			res.end();
		}
	});
});


//add epassstate  register

app.post("/addepassstate",function(req,res){
	
    var countrycode=req.query.countrycode;
    var countryname=req.query.countryname;
    var statecode=req.query.statecode;
    var statename=req.query.statename;
    var updateby=req.query.updateby;
    
    
   
    con.query("SELECT * FROM `epassstate` WHERE statecode='"+statecode+"' OR statename='"+statename+"'",function(err,result){
		if(err){
			throw err;
		}else if(result.length === 0){
			
			con.query("INSERT INTO `epassstate` ( `countrycode`, `countryname`, `statecode`, `statename`,  `updateby`) VALUES ('"+countrycode+"','"+countryname+"','"+statecode+"','"+statename+"','"+updateby+"')",function(err,result){
				
				if(err){
					throw err;
				}else if(result){
					res.json({"StatusCode" : 200,"Message":"State Registered Successfully","Response":result});
					res.end();
				}else{
					res.json({"StatusCode" : 400,"Message":"State Registered Failed","Response":result});
					res.end();
				}
				
			});
		}else{
			
			res.json({"StatusCode" : 400,"Message":"State Details Already Exist!!!"});
			res.end();
		}
	});
	
});

//edit epassstate  register

app.post("/editepassstate",function(req,res){
	
    var countrycode=req.query.countrycode;
    var countryname=req.query.countryname;
    var statecode=req.query.statecode;
    var statename=req.query.statename;
    var status=req.query.status;
    var sno=req.query.sno;
    
    
   
    con.query("SELECT * FROM `epassstate` WHERE (statecode='"+statecode+"' OR statename='"+statename+"') AND status='"+status+"'",function(err,result){
		if(err){
			throw err;
		}else if(result.length === 0){
			
			con.query("UPDATE `epassstate` SET `countrycode`='"+countrycode+"',`countryname`='"+countryname+"',`statecode`='"+statecode+"',`statename`='"+statename+"',`status`='"+status+"' WHERE `sno`='"+sno+"'",function(err,result){
				
				if(err){
					throw err;
				}else if(result){
					res.json({"StatusCode" : 200,"Message":"State Details Changed Successfully","Response":result});
					res.end();
				}else{
					res.json({"StatusCode" : 400,"Message":"State  Details Changed  Failed","Response":result});
					res.end();
				}
				
			});
		}else{
			
			res.json({"StatusCode" : 400,"Message":"State Details Already Exist!!!"});
			res.end();
		}
	});
	
});

//epassstatelist based on Active

app.get('/epassstate',function(req,res){
	
	
	con.query("SELECT * FROM `epassstate` WHERE status='Active'",function(err,result){
		if(err){
			throw err;
		}else if(result!=0){
			res.json({"StatusCode" : 200,"Message":"E Pass State Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"E Pass State Details Doesn't Exists!!!"});
			res.end();
		}
	});
});

//epassstatelist based on

app.get('/allepassstate',function(req,res){
	
	
	con.query("SELECT * FROM `epassstate`",function(err,result){
		if(err){
			throw err;
		}else if(result!=0){
			res.json({"StatusCode" : 200,"Message":"E Pass State Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"E Pass State Details Doesn't Exists!!!"});
			res.end();
		}
	});
});



//add epasscorporation  register

app.post("/addepasscorporation",function(req,res){
	
    var countrycode=req.query.countrycode;
    var countryname=req.query.countryname;
    var statecode=req.query.statecode;
    var statename=req.query.statename;
    var corporationcode=req.query.corporationcode;
    var corporationname=req.query.corporationname;
    var updateby=req.query.updateby;
    
    con.query("SELECT * FROM `epasscorporation` WHERE (statecode='"+statecode+"' OR statename='"+statename+"') AND corporationcode='"+corporationcode+"' ",function(err,result){
		if(err){
			throw err;
		}else if(result.length === 0){
			
			con.query("INSERT INTO `epasscorporation`( `countrycode`, `countryname`, `statecode`, `statename`,`corporationcode`, `corporationname`, `updateby`) VALUES ('"+countrycode+"','"+countryname+"','"+statecode+"','"+statename+"','"+corporationcode+"','"+corporationname+"','"+updateby+"')",function(err,result){
				
				if(err){
					throw err;
				}else if(result){
					res.json({"StatusCode" : 200,"Message":"Corporation Details Registered Successfully","Response":result});
					res.end();
				}else{
					res.json({"StatusCode" : 400,"Message":"Corporation Details Registered Failed","Response":result});
					res.end();
				}
				
			});
		}else{
			
			res.json({"StatusCode" : 400,"Message":"Corporation Details Already Exist!!!"});
			res.end();
		}
	});
	
});


//epass corporation edit 

app.post("/editepasscorporation",function(req,res){
	
    var countrycode=req.query.countrycode;
    var countryname=req.query.countryname;
    var statecode=req.query.statecode;
    var statename=req.query.statename;
    var corporationcode=req.query.corporationcode;
    var corporationname=req.query.corporationname;
    var status=req.query.status;
    var sno=req.query.sno;
    
	
    
    con.query("SELECT * FROM `epasscorporation` WHERE (statecode='"+statecode+"' OR statename='"+statename+"') AND corporationcode='"+corporationcode+"' AND status='"+status+"'  ",function(err,result){
		if(err){
			throw err;
		}else if(result.length === 0){
			
			con.query("UPDATE `epasscorporation` SET `countrycode`='"+countrycode+"',`countryname`='"+countryname+"',`statecode`='"+statecode+"',`statename`='"+statename+"',`corporationcode`='"+corporationcode+"',`corporationname`='"+corporationname+"',`status`='"+status+"' WHERE `sno`='"+sno+"'",function(err,result){
				
				if(err){
					throw err;
				}else if(result){
					res.json({"StatusCode" : 200,"Message":"Corporation Details Changed Successfully","Response":result});
					res.end();
				}else{
					res.json({"StatusCode" : 400,"Message":"Corporation Details Changed Failed","Response":result});
					res.end();
				}
				
			});
		}else{
			
			res.json({"StatusCode" : 400,"Message":"State Details Already Exist!!!"});
			res.end();
		}
	});
	
});


//epasscorporationlist  active

app.get('/epasscorporation',function(req,res){
	
	
	con.query("SELECT * FROM `epasscorporation` WHERE status='Active'",function(err,result){
		if(err){
			throw err;
		}else if(result!=0){
			res.json({"StatusCode" : 200,"Message":"E Pass Corporation Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"E Pass Corporation Details Doesn't Exists!!!"});
			res.end();
		}
	});
});

//allepasscorporationlist  

app.get('/allepasscorporation',function(req,res){
	
	
	con.query("SELECT * FROM `epasscorporation`",function(err,result){
		if(err){
			throw err;
		}else if(result!=0){
			res.json({"StatusCode" : 200,"Message":"E Pass Corporation Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"E Pass Corporation Details Doesn't Exists!!!"});
			res.end();
		}
	});
});

//add epasscity register

app.post("/addepasscity",function(req,res){
	
    var countrycode=req.query.countrycode;
    var countryname=req.query.countryname;
    var statecode=req.query.statecode;
    var statename=req.query.statename;
    var corporationcode=req.query.corporationcode;
    var corporationname=req.query.corporationname;
    var citycode=req.query.citycode;
    var cityname=req.query.cityname;
    var updateby=req.query.updateby;
    
    
   
    con.query("SELECT * FROM `epasscity` WHERE (statecode='"+statecode+"' OR statename='"+statename+"') AND (citycode='"+citycode+"' OR cityname='"+cityname+"')",function(err,result){
		if(err){
			throw err;
		}else if(result.length === 0){
			
			con.query("INSERT INTO `epasscity`( `countrycode`, `countryname`, `statecode`, `statename`, `corporationcode`, `corporationname`, `citycode`, `cityname`, `updateby`) VALUES ('"+countrycode+"','"+countryname+"','"+statecode+"','"+statename+"','"+corporationcode+"','"+corporationname+"','"+citycode+"','"+cityname+"','"+updateby+"')",function(err,result){
				
				if(err){
					throw err;
				}else if(result){
					res.json({"StatusCode" : 200,"Message":"City Registered Successfully","Response":result});
					res.end();
				}else{
					res.json({"StatusCode" : 400,"Message":"City Registered Failed","Response":result});
					res.end();
				}
				
			});
		}else{
			
			res.json({"StatusCode" : 400,"Message":"City Details Already Exist!!!"});
			res.end();
		}
	});
	
});


//edit epasscitylist  active

app.post('/editepasscity',function(req,res){
	
	var status=req.query.status;
    var sno=req.query.sno;
	
	con.query("UPDATE `epasscity` SET `status`='"+status+"' WHERE  `sno`='"+sno+"'",function(err,result){
		if(err){
			throw err;
		}else if(result!=0){
			res.json({"StatusCode" : 200,"Message":"City Status Changed Succesfully!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"City Status Changed Failed!!!"});
			res.end();
		}
	});
});

//epasscitylist  active

app.get('/epasscity',function(req,res){
	
	
	con.query("SELECT * FROM `epasscity` WHERE status='Active'",function(err,result){
		if(err){
			throw err;
		}else if(result!=0){
			res.json({"StatusCode" : 200,"Message":"E Pass City Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"E Pass City Details Doesn't Exists!!!"});
			res.end();
		}
	});
});

//allepasscitylist  

app.get('/allepasscity',function(req,res){
	
	
	con.query("SELECT * FROM `epasscity`",function(err,result){
		if(err){
			throw err;
		}else if(result!=0){
			res.json({"StatusCode" : 200,"Message":"E Pass City Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"E Pass City Details Doesn't Exists!!!"});
			res.end();
		}
	});
});


//User list 
app.get('/userlist',function(req,res){
	
	var role=req.query.role;
	
	con.query("SELECT * FROM `profile` WHERE `role`='"+role+"'",function(err,result){
		if(err){
			throw err;
		}else if(result!=0){
			res.json({"StatusCode" : 200,"Message":"SAdmin Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"SAdmin Details Doesn't Exists!!!"});
			res.end();
		}
	});
});

//Edit User Details

app.post('/edituser',function(req,res){
	
	var userid=req.query.userid || '';
	var name=req.query.name || '';
	var email=req.query.email || '';
	var mobileno=req.query.mobileno || '';
	var password=req.query.password || '';
	var rights=req.query.rights || '';
	
	var statecode=req.query.statecode || '';
	var statename=req.query.statename || '';
	
	var citycode=req.query.citycode || '';
	var cityname=req.query.cityname || '';
	var corporationcode=req.query.corporationcode || '';
	var corporationname=req.query.corporationname || '';
	
	var areaname=req.query.areaname || '';
	var areacode=req.query.areacode || '';
	
	var status=req.query.status;
	
	 con.query("SELECT * FROM `profile` WHERE  mobileno='"+mobileno+"' AND email='"+email+"'",function(err,result){
		if(err){
			throw err;
		}else if(result.length > 0){
	
			con.query("UPDATE `profile` SET `name`='"+name+"',`email`='"+email+"',`mobileno`='"+mobileno+"',`password`='"+password+"',`rights`='"+rights+"',`statecode`='"+statecode+"',`statename`='"+statename+"',`citycode`='"+citycode+"',`cityname`='"+cityname+"',`corporationcode`='"+corporationcode+"',`corporationname`='"+corporationname+"',`areaname`='"+areaname+"',`areacode`='"+areacode+"',`status`='"+status+"' WHERE  `userid`='"+userid+"'",function(err,result){
				if(err){
					throw err;
				}else if(result!=0){
					res.json({"StatusCode" : 200,"Message":"User Details Changed Succesfully!!!" , "Response":result});
					res.end();
				}else{
					res.json({"StatusCode" : 400,"Message":"User Status Changed Failed!!!"});
					res.end();
				}
			});
	}else{
			
			res.json({"StatusCode" : 400,"Message":"Details Already Exist!!!"});
			res.end();
		}
	});
	
});


//add epassarea 


app.post("/addepassarea",function(req,res){
	
    var countrycode=req.query.countrycode;
    var countryname=req.query.countryname;
    var statecode=req.query.statecode;
    var statename=req.query.statename;
    var corporationcode=req.query.corporationcode;
    var corporationname=req.query.corporationname;
    var citycode=req.query.citycode;
    var cityname=req.query.cityname;
    var areacode=req.query.areacode;
    var areaname=req.query.areaname;
    var updateby=req.query.updateby;
    
    
   
    con.query("SELECT * FROM `epassplace` WHERE (statecode='"+statecode+"' OR statename='"+statename+"') AND (citycode='"+citycode+"' OR cityname='"+cityname+"')AND (corporationcode='"+corporationcode+"' OR corporationname='"+corporationname+"')AND areacode='"+areacode+"'",function(err,result){
		if(err){
			throw err;
		}else if(result.length === 0){
			
			con.query("INSERT INTO `epassplace`(`countrycode`, `countryname`, `statecode`, `statename`, `corporationcode`, `corporationname`, `citycode`, `cityname`, `areacode`, `areaname`,  `updateby`) VALUES ('"+countrycode+"','"+countryname+"','"+statecode+"','"+statename+"','"+corporationcode+"','"+corporationname+"','"+citycode+"','"+cityname+"','"+areacode+"','"+areaname+"','"+updateby+"')",function(err,result){
				
				if(err){
					throw err;
				}else if(result){
					res.json({"StatusCode" : 200,"Message":"Area Registered Successfully","Response":result});
					res.end();
				}else{
					res.json({"StatusCode" : 400,"Message":"Area Registered Failed","Response":result});
					res.end();
				}
				
			});
		}else{
			
			res.json({"StatusCode" : 400,"Message":"Area Details Already Exist!!!"});
			res.end();
		}
	});
	
});

//edit epassarealist  active

app.post('/editepassarea',function(req,res){
	
    var statecode=req.query.statecode;
    var statename=req.query.statename;
    var corporationcode=req.query.corporationcode;
    var corporationname=req.query.corporationname;
    var citycode=req.query.citycode;
    var cityname=req.query.cityname;
	var areacode=req.query.areacode;
	var areaname=req.query.areaname;
	var status=req.query.status;
    var sno=req.query.sno;
	
	con.query("SELECT * FROM `epassplace` WHERE (statecode='"+statecode+"' OR statename='"+statename+"') AND (citycode='"+citycode+"' OR cityname='"+cityname+"')AND (corporationcode='"+corporationcode+"' OR corporationname='"+corporationname+"') AND areacode='"+areacode+"' AND areaname='"+areaname+"' AND status='"+status+"'",function(err,result){
		if(err){
			throw err;
		}else if(result.length === 0){
			
			con.query("UPDATE `epassplace` SET `areacode`='"+areacode+"',`areaname`='"+areaname+"',`status`='"+status+"' WHERE  `sno`='"+sno+"'",function(err,result){
				if(err){
					throw err;
				}else if(result!=0){
					res.json({"StatusCode" : 200,"Message":"Area Details Changed Succesfully!!!" , "Response":result});
					res.end();
				}else{
					res.json({"StatusCode" : 400,"Message":"Area Details Changed Failed!!!"});
					res.end();
				}
			});
	}else{
			
			res.json({"StatusCode" : 400,"Message":"Area Details Already Exist!!!"});
			res.end();
		}
	});
});


//epassarealist  active

app.get('/epassarea',function(req,res){
	
	
	con.query("SELECT * FROM `epassplace` WHERE status='Active'",function(err,result){
		if(err){
			throw err;
		}else if(result!=0){
			res.json({"StatusCode" : 200,"Message":"E Pass Area Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"E Pass Area Details Doesn't Exists!!!"});
			res.end();
		}
	});
});

//allepassarealist  

app.get('/allepassarea',function(req,res){
	
	
	con.query("SELECT * FROM `epassplace`",function(err,result){
		if(err){
			throw err;
		}else if(result!=0){
			res.json({"StatusCode" : 200,"Message":"E Pass Area Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"E Pass Area Details Doesn't Exists!!!"});
			res.end();
		}
	});
});

//add epasscounter 


app.post("/addepasscounter",function(req,res){
	
    var countrycode=req.query.countrycode;
    var countryname=req.query.countryname;
    var statecode=req.query.statecode;
    var statename=req.query.statename;
    var corporationcode=req.query.corporationcode;
    var corporationname=req.query.corporationname;
    var citycode=req.query.citycode;
    var cityname=req.query.cityname;
    var areacode=req.query.areacode;
    var areaname=req.query.areaname;
    var countercode=req.query.countercode;
    var countername=req.query.countername;
    var updateby=req.query.updateby;
    
    
   
    con.query("SELECT * FROM `epasscounter` WHERE (statecode='"+statecode+"' OR statename='"+statename+"') AND (citycode='"+citycode+"' OR cityname='"+cityname+"')AND (corporationcode='"+corporationcode+"' OR corporationname='"+corporationname+"')AND areacode='"+areacode+"' AND countercode='"+countercode+"'",function(err,result){
		if(err){
			throw err;
		}else if(result.length === 0){
			
			con.query("INSERT INTO `epasscounter`(`countrycode`, `countryname`, `statecode`, `statename`, `corporationcode`, `corporationname`, `citycode`, `cityname`, `areacode`, `areaname`, `countercode`, `countername`, `updateby`) VALUES ('"+countrycode+"','"+countryname+"','"+statecode+"','"+statename+"','"+corporationcode+"','"+corporationname+"','"+citycode+"','"+cityname+"','"+areacode+"','"+areaname+"','"+countercode+"','"+countername+"','"+updateby+"')",function(err,result){
				
				if(err){
					throw err;
				}else if(result){
					res.json({"StatusCode" : 200,"Message":"Counter Registered Successfully","Response":result});
					res.end();
				}else{
					res.json({"StatusCode" : 400,"Message":"Counter Registered Failed","Response":result});
					res.end();
				}
				
			});
		}else{
			
			res.json({"StatusCode" : 400,"Message":"Counter Details Already Exist!!!"});
			res.end();
		}
	});
	
});

//edit epasscounterlist  active

app.post('/editepasscounter',function(req,res){
	
    var statecode=req.query.statecode;
    var statename=req.query.statename;
    var corporationcode=req.query.corporationcode;
    var corporationname=req.query.corporationname;
    var citycode=req.query.citycode;
    var cityname=req.query.cityname;
	var areacode=req.query.areacode;
	var areaname=req.query.areaname;
	var countercode=req.query.countercode;
	var countername=req.query.countername;
	var status=req.query.status;
    var sno=req.query.sno;
	
	con.query("SELECT * FROM `epasscounter` WHERE (statecode='"+statecode+"' OR statename='"+statename+"') AND (citycode='"+citycode+"' OR cityname='"+cityname+"')AND (corporationcode='"+corporationcode+"' OR corporationname='"+corporationname+"') AND (areacode='"+areacode+"' OR areaname='"+areaname+"') AND countercode='"+countercode+"' AND countername='"+countername+"' AND status='"+status+"'",function(err,result){
		if(err){
			throw err;
		}else if(result.length === 0){
			
			con.query("UPDATE `epasscounter` SET `countercode`='"+countercode+"',`countername`='"+countername+"',`status`='"+status+"' WHERE  `sno`='"+sno+"'",function(err,result){
				if(err){
					throw err;
				}else if(result!=0){
					res.json({"StatusCode" : 200,"Message":"Counter Details Changed Succesfully!!!" , "Response":result});
					res.end();
				}else{
					res.json({"StatusCode" : 400,"Message":"Counter Details Changed Failed!!!"});
					res.end();
				}
			});
	}else{
			
			res.json({"StatusCode" : 400,"Message":"Counter Details Already Exist!!!"});
			res.end();
		}
	});
});


//epasscounterlist  active

app.get('/epasscounter',function(req,res){
	
	
	con.query("SELECT * FROM `epasscounter` WHERE status='Active'",function(err,result){
		if(err){
			throw err;
		}else if(result!=0){
			res.json({"StatusCode" : 200,"Message":"E Pass Counter Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"E Pass Counter Details Doesn't Exists!!!"});
			res.end();
		}
	});
});

//allepasscounterlist  

app.get('/allepasscounter',function(req,res){
	
	
	con.query("SELECT * FROM `epasscounter`",function(err,result){
		if(err){
			throw err;
		}else if(result!=0){
			res.json({"StatusCode" : 200,"Message":"E Pass Counter Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"E Pass Counter Details Doesn't Exists!!!"});
			res.end();
		}
	});
});


//add bus service 

app.post("/addbusservice",function(req,res){
	
    var countrycode=req.query.countrycode;
    var countryname=req.query.countryname;
    var statecode=req.query.statecode;
    var statename=req.query.statename;
    var corporationcode=req.query.corporationcode;
    var corporationname=req.query.corporationname;
    var citycode=req.query.citycode;
    var cityname=req.query.cityname;
    var busservicecode=req.query.busservicecode;
    var busservicename=req.query.busservicename;
    var updateby=req.query.updateby;
    
    
   
    con.query("SELECT * FROM `busservice` WHERE (statecode='"+statecode+"' OR statename='"+statename+"') AND (citycode='"+citycode+"' OR cityname='"+cityname+"')AND corporationcode='"+corporationcode+"' AND busservicecode='"+busservicecode+"' AND busservicename='"+busservicename+"'",function(err,result){
		if(err){
			throw err;
		}else if(result.length === 0){
			
			con.query("INSERT INTO `busservice`(`countrycode`, `countryname`, `statecode`, `statename`, `corporationcode`, `corporationname`, `citycode`, `cityname`, `busservicecode`, `busservicename`,  `updateby`) VALUES ('"+countrycode+"','"+countryname+"','"+statecode+"','"+statename+"','"+corporationcode+"','"+corporationname+"','"+citycode+"','"+cityname+"','"+busservicecode+"','"+busservicename+"','"+updateby+"')",function(err,result){
				
				if(err){
					throw err;
				}else if(result){
					res.json({"StatusCode" : 200,"Message":"Bus Service Registered Successfully","Response":result});
					res.end();
				}else{
					res.json({"StatusCode" : 400,"Message":"Bus Service Registered Failed","Response":result});
					res.end();
				}
				
			});
		}else{
			
			res.json({"StatusCode" : 400,"Message":"Bus Service Details Already Exist!!!"});
			res.end();
		}
	});
	
});


//edit bus service 


app.post("/editbusservice",function(req,res){
	
    var countrycode=req.query.countrycode;
    var countryname=req.query.countryname;
    var statecode=req.query.statecode;
    var statename=req.query.statename;
    var corporationcode=req.query.corporationcode;
    var corporationname=req.query.corporationname;
    var citycode=req.query.citycode;
    var cityname=req.query.cityname;
    var busservicecode=req.query.busservicecode;
    var busservicename=req.query.busservicename;
    var sno=req.query.sno;
    var status=req.query.status;
    
    
   
    con.query("SELECT * FROM `busservice` WHERE (statecode='"+statecode+"' OR statename='"+statename+"') AND (citycode='"+citycode+"' OR cityname='"+cityname+"')AND corporationcode='"+corporationcode+"' AND busservicecode='"+busservicecode+"' AND busservicename='"+busservicename+"'  AND status='"+status+"'",function(err,result){
		if(err){
			throw err;
		}else if(result.length === 0){
			
			con.query("UPDATE `busservice` SET `busservicecode`='"+busservicecode+"',`busservicename`='"+busservicename+"',`status`='"+status+"' WHERE `sno`='"+sno+"'",function(err,result){
				
				if(err){
					throw err;
				}else if(result){
					res.json({"StatusCode" : 200,"Message":"Bus Service Details Changed Successfully","Response":result});
					res.end();
				}else{
					res.json({"StatusCode" : 400,"Message":"Bus Service Details Changed Failed","Response":result});
					res.end();
				}
				
			});
		}else{
			
			res.json({"StatusCode" : 400,"Message":"Bus Service Details Already Exist!!!"});
			res.end();
		}
	});
	
});


//all bus service list

app.get('/allbusservice',function(req,res){
	
	
	con.query("SELECT * FROM `busservice`",function(err,result){
		if(err){
			throw err;
		}else if(result!=0){
			res.json({"StatusCode" : 200,"Message":"E Pass Bus Service Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"E Pass Bus Service Details Doesn't Exists!!!"});
			res.end();
		}
	});
});


// bus service list active

app.get('/busservice',function(req,res){
	
	
	con.query("SELECT * FROM `busservice` WHERE status='Active'",function(err,result){
		if(err){
			throw err;
		}else if(result!=0){
			res.json({"StatusCode" : 200,"Message":"E Pass Bus Service Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"E Pass Bus Service Details Doesn't Exists!!!"});
			res.end();
		}
	});
});

//add pass scheme 

app.post("/addpassscheme",function(req,res){
	
    var countrycode=req.query.countrycode;
    var countryname=req.query.countryname;
    var statecode=req.query.statecode;
    var statename=req.query.statename;
    var corporationcode=req.query.corporationcode;
    var corporationname=req.query.corporationname;
    var citycode=req.query.citycode;
    var cityname=req.query.cityname;
    var passschemename=req.query.passschemename;
    var updateby=req.query.updateby;
    
   
   
    con.query("SELECT * FROM `passscheme` WHERE (statecode='"+statecode+"' OR statename='"+statename+"') AND (citycode='"+citycode+"' OR cityname='"+cityname+"')AND corporationcode='"+corporationcode+"'  AND passschemename='"+passschemename+"'",function(err,result){
		if(err){
			throw err;
		}else if(result.length === 0){
			
			con.query("INSERT INTO `passscheme`(`countrycode`, `countryname`, `statecode`, `statename`, `corporationcode`, `corporationname`, `citycode`, `cityname`, `passschemename`, `updateby`) VALUES ('"+countrycode+"','"+countryname+"','"+statecode+"','"+statename+"','"+corporationcode+"','"+corporationname+"','"+citycode+"','"+cityname+"','"+passschemename+"','"+updateby+"')",function(err,result){
				
				if(err){
					throw err;
				}else if(result){
					res.json({"StatusCode" : 200,"Message":"Pass Scheme Registered Successfully","Response":result});
					res.end();
				}else{
					res.json({"StatusCode" : 400,"Message":"Pass Scheme Registered Failed","Response":result});
					res.end();
				}
				
			});
		}else{
			
			res.json({"StatusCode" : 400,"Message":"Pass Scheme Details Already Exist!!!"});
			res.end();
		}
	});
	
});


//edit pass scheme


app.post("/editpassscheme",function(req,res){
	
    var countrycode=req.query.countrycode;
    var countryname=req.query.countryname;
    var statecode=req.query.statecode;
    var statename=req.query.statename;
    var corporationcode=req.query.corporationcode;
    var corporationname=req.query.corporationname;
    var citycode=req.query.citycode;
    var cityname=req.query.cityname;
    
    var passschemename=req.query.passschemename;
    var passschemeno=req.query.passschemeno;
    var status=req.query.status;
    
    
   
    con.query("SELECT * FROM `passscheme` WHERE (statecode='"+statecode+"' OR statename='"+statename+"') AND (citycode='"+citycode+"' OR cityname='"+cityname+"')AND corporationcode='"+corporationcode+"' AND passschemeno='"+passschemeno+"' AND passschemename='"+passschemename+"'  AND status='"+status+"'",function(err,result){
		if(err){
			throw err;
		}else if(result.length === 0){
			
			con.query("UPDATE `passscheme` SET `passschemename`='"+passschemename+"',`status`='"+status+"' WHERE `passschemeno`='"+passschemeno+"'",function(err,result){
				
				if(err){
					throw err;
				}else if(result){
					res.json({"StatusCode" : 200,"Message":"Pass Scheme Details Changed Successfully","Response":result});
					res.end();
				}else{
					res.json({"StatusCode" : 400,"Message":"Pass Scheme Details Changed Failed","Response":result});
					res.end();
				}
				
			});
		}else{
			
			res.json({"StatusCode" : 400,"Message":"Pass Scheme Details Already Exist!!!"});
			res.end();
		}
	});
	
});


//all pass scheme list

app.get('/allpassscheme',function(req,res){
	
	
	con.query("SELECT * FROM `passscheme`",function(err,result){
		if(err){
			throw err;
		}else if(result!=0){
			res.json({"StatusCode" : 200,"Message":"E Pass Pass Scheme Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"E Pass Pass Scheme Details Doesn't Exists!!!"});
			res.end();
		}
	});
});


// pass scheme list active

app.get('/passscheme',function(req,res){
	
	
	con.query("SELECT * FROM `passscheme` WHERE status='Active'",function(err,result){
		if(err){
			throw err;
		}else if(result!=0){
			res.json({"StatusCode" : 200,"Message":"E Pass Pass Scheme Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"E Pass Pass Scheme Details Doesn't Exists!!!"});
			res.end();
		}
	});
});


//add pass type 

app.post("/addpasstype",function(req,res){
	
    var countrycode=req.query.countrycode;
    var countryname=req.query.countryname;
    var statecode=req.query.statecode;
    var statename=req.query.statename;
    var corporationcode=req.query.corporationcode;
    var corporationname=req.query.corporationname;
    var citycode=req.query.citycode;
    var cityname=req.query.cityname;
    var passschemeno=req.query.passschemeno;
    var passschemename=req.query.passschemename;
    var passtypename=req.query.passtypename;
    var restriction=req.query.restriction || '';
    var updateby=req.query.updateby;
    
   
   
    con.query("SELECT * FROM `passtype` WHERE (statecode='"+statecode+"' OR statename='"+statename+"') AND (citycode='"+citycode+"' OR cityname='"+cityname+"')AND corporationcode='"+corporationcode+"'  AND passschemeno='"+passschemeno+"' AND passtypename='"+passtypename+"'",function(err,result){
		if(err){
			throw err;
		}else if(result.length === 0){
			
			con.query("INSERT INTO `passtype`(`countrycode`, `countryname`, `statecode`, `statename`, `corporationcode`, `corporationname`, `citycode`, `cityname`,`passschemeno`, `passschemename`,`passtypename`, `restriction`,`updateby`) VALUES ('"+countrycode+"','"+countryname+"','"+statecode+"','"+statename+"','"+corporationcode+"','"+corporationname+"','"+citycode+"','"+cityname+"','"+passschemeno+"','"+passschemename+"','"+passtypename+"','"+restriction+"','"+updateby+"')",function(err,result){
				
				if(err){
					throw err;
				}else if(result){
					res.json({"StatusCode" : 200,"Message":"Pass Type Registered Successfully","Response":result});
					res.end();
				}else{
					res.json({"StatusCode" : 400,"Message":"Pass Type Registered Failed","Response":result});
					res.end();
				}
				
			});
		}else{
			
			res.json({"StatusCode" : 400,"Message":"Pass Type Details Already Exist!!!"});
			res.end();
		}
	});
	
});


//edit  passtype


app.post("/editpasstype",function(req,res){
	
    var countrycode=req.query.countrycode;
    var countryname=req.query.countryname;
    var statecode=req.query.statecode;
    var statename=req.query.statename;
    var corporationcode=req.query.corporationcode;
    var corporationname=req.query.corporationname;
    var citycode=req.query.citycode;
    var cityname=req.query.cityname;
    
    var passschemename=req.query.passschemename;
    var passschemeno=req.query.passschemeno;
    var passtypeno=req.query.passtypeno;
    var passtypename=req.query.passtypename;
	var restriction=req.query.restriction || '';
    var status=req.query.status;
    
    
   
    con.query("SELECT * FROM `passtype` WHERE (statecode='"+statecode+"' OR statename='"+statename+"') AND (citycode='"+citycode+"' OR cityname='"+cityname+"')AND corporationcode='"+corporationcode+"' AND passschemeno='"+passschemeno+"' AND passtypeno='"+passtypeno+"' AND  passtypename='"+passtypename+"' AND status='"+status+"' AND restriction='"+restriction+"'",function(err,result){
		if(err){
			throw err;
		}else if(result.length === 0){
			
			con.query("UPDATE `passtype` SET `passtypename`='"+passtypename+"',`restriction`='"+restriction+"',`status`='"+status+"' WHERE `passtypeno`='"+passtypeno+"'",function(err,result){
				
				if(err){
					throw err;
				}else if(result){
					res.json({"StatusCode" : 200,"Message":"Pass Type Details Changed Successfully","Response":result});
					res.end();
				}else{
					res.json({"StatusCode" : 400,"Message":"Pass Type Details Changed Failed","Response":result});
					res.end();
				}
				
			});
		}else{
			
			res.json({"StatusCode" : 400,"Message":"Pass Type Details Already Exist!!!"});
			res.end();
		}
	});
	
});


//all  passtype list

app.get('/allpasstype',function(req,res){
	
	
	con.query("SELECT * FROM `passtype`",function(err,result){
		if(err){
			throw err;
		}else if(result!=0){
			res.json({"StatusCode" : 200,"Message":"E Pass Pass Type Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"E Pass Pass Type Details Doesn't Exists!!!"});
			res.end();
		}
	});
});


//  passtype list active

app.get('/passtype',function(req,res){
	
	
	con.query("SELECT * FROM `passtype` WHERE status='Active'",function(err,result){
		if(err){
			throw err;
		}else if(result!=0){
			res.json({"StatusCode" : 200,"Message":"E Pass Pass Type Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"E Pass Pass Type Details Doesn't Exists!!!"});
			res.end();
		}
	});
});


//add fair details 

app.post("/addfairdetails",function(req,res){
	
    var countrycode=req.query.countrycode;
    var countryname=req.query.countryname;
    var statecode=req.query.statecode;
    var statename=req.query.statename;
    var corporationcode=req.query.corporationcode;
    var corporationname=req.query.corporationname;
    var citycode=req.query.citycode;
    var cityname=req.query.cityname;
    var passschemeno=req.query.passschemeno;
    var passschemename=req.query.passschemename;
    var passtypeno=req.query.passtypeno;
    var passtypename=req.query.passtypename;
    var restriction=req.query.restriction || '';
    var duration=req.query.duration || '';
    var allovercity=req.query.allovercity || '';
    var fromlocation=req.query.fromlocation || '';
    var tolocation=req.query.tolocation || '';
    var amount=req.query.amount || '';
    var updateby=req.query.updateby;
    
  
   
    con.query("SELECT * FROM `fairdetails` WHERE (statecode='"+statecode+"' OR statename='"+statename+"') AND (citycode='"+citycode+"' OR cityname='"+cityname+"')AND corporationcode='"+corporationcode+"'  AND passschemeno='"+passschemeno+"' AND passtypeno='"+passtypeno+"' AND ((allovercity='"+allovercity+"') AND ((fromlocation='"+fromlocation+"' AND tolocation='"+tolocation+"') OR (fromlocation='"+tolocation+"' AND tolocation='"+fromlocation+"')) )",function(err,result){
		if(err){
			throw err;
		}else if(result.length === 0){
			
			con.query("INSERT INTO `fairdetails`(`countrycode`, `countryname`, `statecode`, `statename`, `corporationcode`, `corporationname`, `citycode`, `cityname`, `passschemeno`, `passschemename`, `passtypeno`, `passtypename`,`restriction`, `duration`, `allovercity`, `fromlocation`, `tolocation`, `amount`, `updateby`) VALUES ('"+countrycode+"','"+countryname+"','"+statecode+"','"+statename+"','"+corporationcode+"','"+corporationname+"','"+citycode+"','"+cityname+"','"+passschemeno+"','"+passschemename+"','"+passtypeno+"','"+passtypename+"','"+restriction+"','"+duration+"','"+allovercity+"','"+fromlocation+"','"+tolocation+"','"+amount+"','"+updateby+"')",function(err,result){
				
				if(err){
					throw err;
				}else if(result){
					res.json({"StatusCode" : 200,"Message":"Fair Details Registered Successfully","Response":result});
					res.end();
				}else{
					res.json({"StatusCode" : 400,"Message":"Fair Details Registered Failed","Response":result});
					res.end();
				}
				
			});
		}else{
			
			res.json({"StatusCode" : 400,"Message":"Fair  Details Already Exist!!!"});
			res.end();
		}
	});
	
});


//edit fair details 

app.post("/editfairdetails",function(req,res){
	
    var countrycode=req.query.countrycode;
    var countryname=req.query.countryname;
    var statecode=req.query.statecode;
    var statename=req.query.statename;
    var corporationcode=req.query.corporationcode;
    var corporationname=req.query.corporationname;
    var citycode=req.query.citycode;
    var cityname=req.query.cityname;
    var passschemeno=req.query.passschemeno;
    var passschemename=req.query.passschemename;
    var passtypeno=req.query.passtypeno;
    var passtypename=req.query.passtypename;
    var restriction=req.query.restriction || '';
    var duration=req.query.duration || '';
    var allovercity=req.query.allovercity || '';
    var fromlocation=req.query.fromlocation || '';
    var tolocation=req.query.tolocation || '';
    var amount=req.query.amount || '';
   
    var sno=req.query.sno;
	var status=req.query.status;
  
   
    con.query("SELECT * FROM `fairdetails` WHERE (statecode='"+statecode+"' OR statename='"+statename+"') AND (citycode='"+citycode+"' OR cityname='"+cityname+"')AND corporationcode='"+corporationcode+"'  AND passschemeno='"+passschemeno+"' AND passtypeno='"+passtypeno+"' AND ((allovercity='"+allovercity+"') OR ((fromlocation='"+fromlocation+"' AND tolocation='"+tolocation+"') OR (fromlocation='"+tolocation+"' AND tolocation='"+fromlocation+"')) ) AND status='"+status+"'",function(err,result){
		if(err){
			throw err;
		}else if(result.length === 0){
			
			con.query("UPDATE `fairdetails` SET `duration`='"+duration+"',`allovercity`='"+allovercity+"',`fromlocation`='"+fromlocation+"',`tolocation`='"+tolocation+"',`amount`='"+amount+"',`status`='"+status+"' WHERE sno='"+sno+"'",function(err,result){
				
				if(err){
					throw err;
				}else if(result){
					res.json({"StatusCode" : 200,"Message":"Fair Details Changed Successfully","Response":result});
					res.end();
				}else{
					res.json({"StatusCode" : 400,"Message":"Fair Details Changed Failed","Response":result});
					res.end();
				}
				
			});
		}else{
			
			res.json({"StatusCode" : 400,"Message":"Fair  Details Already Exist!!!"});
			res.end();
		}
	});
	
});



//all  fairdetails city list

app.get('/allfairdetailscity',function(req,res){
	
	
	con.query("SELECT * FROM `fairdetails` WHERE `allovercity`='allovercity' AND `fromlocation`='' AND `tolocation`='' ",function(err,result){
		if(err){
			throw err;
		}else if(result.length!=0){
			res.json({"StatusCode" : 200,"Message":"E Pass Fair  Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"E Pass Fair  Details Doesn't Exists!!!"});
			res.end();
		}
	});
});


//  fairdetails list city active

app.get('/fairdetailscity',function(req,res){
	
	
	con.query("SELECT * FROM `fairdetails` WHERE `allovercity`='allovercity'  AND status='Active'",function(err,result){
		if(err){
			throw err;
		}else if(result.length!=0){
			res.json({"StatusCode" : 200,"Message":"E Pass Fair  Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"E Pass Fair  Details Doesn't Exists!!!"});
			res.end();
		}
	});
});

//all  fairdetails location list

app.get('/allfairdetailslocation',function(req,res){
	
	
	con.query("SELECT * FROM `fairdetails` WHERE `allovercity`='' ",function(err,result){
		if(err){
			throw err;
		}else if(result.length!=0){
			res.json({"StatusCode" : 200,"Message":"E Pass Fair  Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"E Pass Fair  Details Doesn't Exists!!!"});
			res.end();
		}
	});
});


//  fairdetails list location active

app.get('/fairdetailslocation',function(req,res){
	
	
	con.query("SELECT * FROM `fairdetails` WHERE `allovercity`=''  AND status='Active'",function(err,result){
		if(err){
			throw err;
		}else if(result.length!=0){
			res.json({"StatusCode" : 200,"Message":"E Pass Fair  Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"E Pass Fair  Details Doesn't Exists!!!"});
			res.end();
		}
	});
});




/* ----------------------------------------------------------------------------------------

DAILY PASS STARTS

-------------------------------------------------------------------------------------------- */

//distinct state in fairdetails


app.get('/distinctstatefair',function(req,res){
	
	con.query("SELECT DISTINCT(statecode),(statename)  FROM `fairdetails` WHERE `allovercity`='allovercity'  AND status='Active'",function(err,result){
		if(err){
			throw err;
		}else if(result.length!=0){
			res.json({"StatusCode" : 200,"Message":"E Pass State  Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"E Pass State  Details Doesn't Exists!!!"});
			res.end();
		}
	});
});

//distinct corporation in fairdetails


app.get('/distinctcorporationfair',function(req,res){
	
	var statecode=req.query.statecode;
	
	con.query("SELECT DISTINCT(corporationcode),(corporationname)  FROM `fairdetails` WHERE `statecode`='"+statecode+"' AND `allovercity`='allovercity'  AND status='Active'",function(err,result){
		if(err){
			throw err;
		}else if(result.length!=0){
			res.json({"StatusCode" : 200,"Message":"E Pass Corporation  Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"E Pass Corporation  Details Doesn't Exists!!!"});
			res.end();
		}
	});
});

//distinct city in fairdetails


app.get('/distinctcityfair',function(req,res){
	
	var statecode=req.query.statecode;
	var corporationcode=req.query.corporationcode;
	
	con.query("SELECT DISTINCT(citycode),(cityname)  FROM `fairdetails` WHERE `statecode`='"+statecode+"' AND `corporationcode`='"+corporationcode+"' AND `allovercity`='allovercity'  AND status='Active'",function(err,result){
		if(err){
			throw err;
		}else if(result.length!=0){
			res.json({"StatusCode" : 200,"Message":"E Pass City  Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"E Pass City  Details Doesn't Exists!!!"});
			res.end();
		}
	});
});

//distinct passtype in fairdetails


app.get('/distinctpasstypefair',function(req,res){
	
	var statecode=req.query.statecode;
	var corporationcode=req.query.corporationcode;
	var passschemename=req.query.passschemename;
	
	con.query("SELECT DISTINCT(passtypeno),(passtypename)  FROM `fairdetails` WHERE `statecode`='"+statecode+"' AND `corporationcode`='"+corporationcode+"' AND `passschemename`='"+passschemename+"'   AND status='Active'",function(err,result){
		if(err){
			throw err;
		}else if(result.length!=0){
			res.json({"StatusCode" : 200,"Message":"E Pass PassType  Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"E Pass PassType  Details Doesn't Exists!!!"});
			res.end();
		}
	});
});

//amount city in fairdetails


app.get('/getamountcity',function(req,res){
	
	var statecode=req.query.statecode;
	var corporationcode=req.query.corporationcode;
	var passschemename=req.query.passschemename;
	var passtypeno=req.query.passtypeno;
	
	con.query("SELECT *  FROM `fairdetails` WHERE `statecode`='"+statecode+"' AND `corporationcode`='"+corporationcode+"' AND `passschemename`='"+passschemename+"' AND `passtypeno`='"+passtypeno+"'  AND status='Active'",function(err,result){
		if(err){
			throw err;
		}else if(result.length!=0){
			res.json({"StatusCode" : 200,"Message":"E Pass PassType  Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"E Pass PassType  Details Doesn't Exists!!!"});
			res.end();
		}
	});
});

// pass list based userid 

app.get('/passengerpasslist',function(req,res){
	
	var userid=req.query.userid;
	var passschemename=req.query.passschemename;
	
	con.query("SELECT * FROM `epass` WHERE `userid`='"+userid+"' AND `passschemename`='"+passschemename+"'",function(err,result){
		if(err){
			throw err;
		}else if(result.length!=0){
			res.json({"StatusCode" : 200,"Message":"Daily Pass  Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"Daily Pass Details Doesn't Exists!!!"});
			res.end();
		}
	});
});


/* ----------------------------------------------------------------------------------------

DAILY PASS ENDS

-------------------------------------------------------------------------------------------- */
/* ----------------------------------------------------------------------------------------

MONTHLY PASS STARTS

-------------------------------------------------------------------------------------------- */ 

//location get from fair details

app.get('/distinctlocationfair',function(req,res){
	
	var statecode=req.query.statecode;
	var corporationcode=req.query.corporationcode;
	var citycode=req.query.citycode;
	
	con.query("(SELECT fromlocation AS location FROM `fairdetails` WHERE  status='Active' AND `statecode`='"+statecode+"' AND `corporationcode`='"+corporationcode+"' AND `citycode`='"+citycode+"' AND `passschemename`='Monthly Pass') UNION  (SELECT tolocation FROM `fairdetails` WHERE  status='Active' AND `statecode`='"+statecode+"' AND `corporationcode`='"+corporationcode+"' AND `citycode`='"+citycode+"' AND `passschemename`='Monthly Pass')",function(err,result){
		if(err){
			throw err;
		}else if(result.length!=0){
			res.json({"StatusCode" : 200,"Message":"E Pass Location  Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"E Pass Location Details Doesn't Exists!!!"});
			res.end();
		}
	});
});

//amount location in fairdetails


app.get('/getamountlocation',function(req,res){
	
	var statecode=req.query.statecode;
	var corporationcode=req.query.corporationcode;
	var citycode=req.query.citycode;
	var passschemename=req.query.passschemename;
	var passtypeno=req.query.passtypeno;
	var fromlocation=req.query.fromlocation;
	var tolocation=req.query.tolocation;
	
	con.query("SELECT *  FROM `fairdetails` WHERE `statecode`='"+statecode+"' AND `corporationcode`='"+corporationcode+"' AND `citycode` ='"+citycode+"' AND `passschemename`='"+passschemename+"' AND `passtypeno`='"+passtypeno+"' AND ((fromlocation='"+fromlocation+"' AND tolocation='"+tolocation+"') OR (fromlocation='"+tolocation+"' AND tolocation='"+fromlocation+"')) AND status='Active'",function(err,result){
		
		if(err){
			throw err;
		}else if(result.length!=0){
			res.json({"StatusCode" : 200,"Message":"E Pass Amount  Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"E Pass Amount  Details Doesn't Exists!!!"});
			res.end();
		}
	});
});




/* ----------------------------------------------------------------------------------------

MONTHLY PASS ENDS

-------------------------------------------------------------------------------------------- */
//SELECT countrycode AS location FROM `fairdetails` UNION   SELECT statecode FROM `fairdetails`

//createpass
app.post('/createpass',function(req,res){
	var passid=req.query.passid || '';
	var userid=req.query.userid || '';
	var name=req.query.name || '';
	var email=req.query.email || '';
	var mobileno=req.query.mobileno || '';
	var prooftype=req.query.prooftype || '';
	var proofid=req.query.proofid || '';
	var countrycode=req.query.countrycode || '';
	var countryname=req.query.countryname || '';
	var statecode=req.query.statecode || '';
	var statename=req.query.statename || '';
	var corporationcode=req.query.corporationcode || '';
	var corporationname=req.query.corporationname || '';
	var citycode=req.query.citycode || '';
	var cityname=req.query.cityname || '';
	var areacode=req.query.areacode || '';
	var areaname=req.query.areaname || '';
	var countercode=req.query.countercode || '';
	var countername=req.query.countername || '';
	var passschemeno=req.query.passschemeno || '';
	var passschemename=req.query.passschemename || '';
	var passtypeno=req.query.passtypeno || '';
	var passtypename=req.query.passtypename || '';
	var restriction=req.query.restriction || '';
	var duration=req.query.duration || '';
	var allovercity=req.query.allovercity || '';
	var fromlocation=req.query.fromlocation || '';
	var tolocation=req.query.tolocation || '';
	var amount=req.query.amount || '';
	var referenceid=req.query.referenceid || '';
	var updateby=req.query.updateby || '';
	
	
	/* con.query("SELECT * FROM `epass` WHERE passid='"+passid+"' AND userid='"+userid+"'   ",function(err,result){
		if(err){
			throw err;
		}else if(result.length === 0){ */
			
			con.query("INSERT INTO `epass`( `passid`, `userid`, `name`, `email`, `mobileno`, `prooftype`, `proofid`, `countrycode`, `countryname`, `statecode`, `statename`, `corporationcode`, `corporationname`, `citycode`, `cityname`, `areacode`, `areaname`, `countercode`, `countername`, `passschemeno`, `passschemename`, `passtypeno`, `passtypename`, `restriction`, `duration`, `allovercity`, `fromlocation`, `tolocation`, `amount`, `referenceid`, `expirydate`,  `updateby`) VALUES ('"+passid+"','"+userid+"','"+name+"','"+email+"','"+mobileno+"','"+prooftype+"','"+proofid+"','"+countrycode+"','"+countryname+"','"+statecode+"','"+statename+"','"+corporationcode+"','"+corporationname+"','"+citycode+"','"+cityname+"','"+areacode+"','"+areaname+"','"+countercode+"','"+countername+"','"+passschemeno+"','"+passschemename+"','"+passtypeno+"','"+passtypename+"','"+restriction+"','"+duration+"','"+allovercity+"','"+fromlocation+"','"+tolocation+"','"+amount+"','"+referenceid+"',CURRENT_DATE + INTERVAL "+(+duration)+" DAY,'"+updateby+"')",function(err,result){
				
				if(err){
					throw err;
				}else if(result.length!=0){
					var result="Pass Created Successfully. \n User ID  : "+userid+" \n Pass ID : "+passid+"";
					if(mobileno!=('' && null)){
						epassotpsendfunction(mobileno,result);
					}else{
						epassotpsendfunction(email,result);
					}
					
					res.json({"StatusCode" : 200,"Message":"E Pass Created Succesfully!!!" , "Response":result});
					res.end();
				}else{
					var result="Pass Created Failed. Create After Some times.";
					if(mobileno!=('' && null)){
						epassotpsendfunction(mobileno,result);
					}else{
						epassotpsendfunction(email,result);
					}
					res.json({"StatusCode" : 400,"Message":"E Pass Pass Created Failed!!!"});
					res.end();
				}
			});
		/* }else{
				
				res.json({"StatusCode" : 400,"Message":"Pass  Details Already Exist.Renewal that Pass"});
				res.end();
		}
	}); */
});

//renewal pass

app.post('/renewalpass',function(req,res){
	
	var passid=req.query.passid;
	
	con.query("UPDATE `epass` SET `status`='Active',`expirydate`= `expirydate` + INTERVAL `duration` day WHERE `passid`='"+passid+"'",function(err,result){
		if(err){
			throw err;
		}else if(result){
			
			
			res.json({"StatusCode" : 200,"Message":"Renew Pass Succesfully!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"Renew Pass Failed!!!"});
			res.end();
		}
	});
});



//proof update in epass
app.post('/epassproofupdate',function(req,res){
	
	var prooftype=req.query.prooftype;
	var proofid=req.query.proofid;
	var userid=req.query.userid;
	
	con.query(" UPDATE `epass` SET `prooftype`='"+prooftype+"',`proofid`='"+proofid+"' WHERE `userid`='"+userid+"'",function(err,result){
		if(err){
			throw err;
		}else if(result){
			res.json({"StatusCode" : 200,"Message":"Proof Update Succesfully!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"Proof Update Failed!!!"});
			res.end();
		}
	});
});


//passscheme no find for add passtype xslx


app.get('/passschemenofind',function(req,res){
	
	var statecode=req.query.statecode;
	var corporationcode=req.query.corporationcode;
	var citycode=req.query.citycode;
	var passschemename=req.query.passschemename;
	
	con.query("SELECT `passschemeno` FROM `passscheme` WHERE `countrycode`='IN' AND `statecode`='"+statecode+"' AND `corporationcode`='"+corporationcode+"' AND `citycode`='"+citycode+"' AND `passschemename`='"+passschemename+"' AND `status`='Active'",function(err,result){
		if(err){
			throw err;
		}else if(result.length!=0){
			res.json({"StatusCode" : 200,"Message":"E Pass Scheme No  Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"E Pass Scheme No Details Doesn't Exists!!!"});
			res.end();
		}
	});
});

//passscheme no  and passtype no find for add fairdetails xslx


app.get('/passschemetypenofind',function(req,res){
	
	var statecode=req.query.statecode;
	var corporationcode=req.query.corporationcode;
	var citycode=req.query.citycode;
	var passschemename=req.query.passschemename;
	var passtypename=req.query.passtypename;
	
	con.query("SELECT `passtypeno`,`passschemeno`,`restriction` FROM `passtype` WHERE `countrycode`='IN' AND `statecode`='"+statecode+"' AND `corporationcode`='"+corporationcode+"' AND `citycode`='"+citycode+"' AND `passschemename`='"+passschemename+"' AND `passtypename`='"+passtypename+"' AND `status`='Active'",function(err,result){
		if(err){
			throw err;
		}else if(result.length!=0){
			res.json({"StatusCode" : 200,"Message":"E Pass Scheme and No   Details!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"E Pass Scheme and No  Details Doesn't Exists!!!"});
			res.end();
		}
	});
});




app.post('/passexpired',function(req,res){
	

	con.query(" UPDATE `epass` SET `status`='Expired' WHERE  `expirydate`<CURRENT_DATE",function(err,result){
		if(err){
			throw err;
		}else if(result){
			res.json({"StatusCode" : 200,"Message":"Pass Status Update Succesfully!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"Pass Status Update Failed!!!"});
			res.end();
		}
	});
});

app.get('/passinfo',function(req,res){
	
	var passid=req.query.passid;
	con.query("SELECT * FROM `epass` WHERE `passid`='"+passid+"' OR `rfid`='"+passid+"' ",function(err,result){
		if(err){
			throw err;
		}else if(result.length>0){
			res.json({"StatusCode" : 200,"Message":"Pass Status!!!" , "Response":result});
			res.end();
		}else{
			res.json({"StatusCode" : 400,"Message":"Pass Status Not Found!!!"});
			res.end();
		}
	});
});





module.exports = app;








