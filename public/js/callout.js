define(function() {
    console.log("callout");
    async function getAuthInfo(){
      const response = await fetch('https://mcwd-d2pprjfdcksy88llpp9dv-4.auth.marketingcloudapis.com/v2/userinfo', {
          method: 'GET',
          headers:{
            'Content-Type': "application/json",
            'accept-encoding': "gzip",
            'credentials': "same-origin",
            'Authorization': "Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6IjEiLCJ2ZXIiOiIxIiwidHlwIjoiSldUIn0.eyJhY2Nlc3NfdG9rZW4iOiJYMVpPa3lORkhIcmluRDlRTmtYNWpWeE4iLCJjbGllbnRfaWQiOiI3NWx0cGxhb3Z5Z2tyaHF6cmtiaTI3eWoiLCJlaWQiOjUwMDAwODQyOCwic3RhY2tfa2V5IjoiUzUwIiwicGxhdGZvcm1fdmVyc2lvbiI6MiwiY2xpZW50X3R5cGUiOiJTZXJ2ZXJUb1NlcnZlciJ9.0GfSLhWW79DNIR6oH9OsRC5LXpHljZQXQ9QQQ5EGisY.oUQrE_0OVJdBObpDN72ohBAbwiQagRM3n_JixBfI-o_0J7es_y25QGZa56TxIcsNM_sjJ3Xj-yAw9HMKrI9_eD4qTxAF-4TiYoK9wJluRn4mVJEcpdMZECyXewq6rpTW2m5mxtG7CDd2QMTzJTqGwa7041f9Y9JrED_jboB6KLPt5-UrCH-"
          },
          mode: "no-cors"
        });
        console.log(response);
      const myJson =  await response.json();
      console.log(myJson);
      return 'toto';
  }
  
  async function getAppAvailable(token){
    const response = await fetch('/getApplicationList', {
        method: 'GET',
        params: {token: token},
      });
      console.log(response);
    const myJson =  await response.json();
    console.log(myJson);
    return myJson;
}
    return {
        getAuthInfo : getAuthInfo,
        getAppAvailable: getAppAvailable,
      getAuthInfoAjax: function(token){
        $.ajax({
          type: 'GET',
          params: { token: token},
          crossDomain: true,            
          contentType: 'application/json',
          url: '/getApplicationList',
          headers: {},						
          success: function(data) {
            console.log(data);
          }
        })
      }
    }
});