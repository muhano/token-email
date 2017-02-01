//route untik kirim email verifikasi
router.post('/daftar-user', function(req, res){  
//fungsi untuk pendaftaran user dan input data ke database di sini

//berikut fungsi untuk mengirim email verifikasi user menggunakan nodemailer dan async
async.waterfall([  
 function(done) {
  //membuat token
  crypto.randomBytes(20, function(err, buf) {
   var token = buf.toString('hex');
   done(err, token);
   })
 },
 //memasukkan nilai token ke dalam user document
 function(token, done) {
  User.findOne({idUser: req.user.idUser}, function(err, user){
   user.emailVerificationToken = token;
   user.save(function(err) {
    done(err, token, user)
   });
  });
 },
 //kirim email konfirmasi ke user
 function(token, user, done) {
  var smtpTransport = nodemailer.createTransport({
   service: 'Gmail',
   auth: {
   user: 'alamat.email@gmail.com',
   pass: 'password'
   }
  });
  var mailOptions = {
   to: req.user.email,
   from: 'no-reply@gmail.com',
   subject: 'Email Verification',
   html: '<p>Hai ' + user.email + ','+
         'terimakasih telah membuat akun di aplikasi kami.</br>'+
         'Silahkan verifikasi email dengan mengklik link berikut:</br> ' +
         '<a href=http://' + req.headers.host + '/verifikasi-email/' + token +'>Konfirmasi</a>'
  };
  smtpTransport.sendMail(mailOptions, function(err) {
   req.flash('SaveSuccess', 'Email Verifikasi telah dikirim ke ' + req.user.email);
  });
 }
], function(err){
 if(err)
  return next(err);
});



//route untuk verifikasi email token
router.get('/verifikasi-email/:token', function(req, res){

    User.findOneAndUpdate(
        {emailVerificationToken: req.params.token},
        {$set: {
            emailConfirmed : 'yes'
        }, $unset: {
            emailVerificationToken: ''
        }},
        {
            save: true,
            upsert: false
        },
        function(err, user){
            if (err)
                res.send(err);
            if (user.role == 'guru') {
                req.flash('SaveSuccess', 'Terima Kasih, Email Anda Sudah diverifikasi');
                res.redirect('/guru');
            }
            else if (data.role == 'unverified') {
                res.redirect('/verified-data');
            }
        }
    );

});
