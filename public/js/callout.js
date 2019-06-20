define(function () {
  console.log("callout");

  async function getAppAvailable(endpoint, token) {
    const response = await fetch('/getApplicationList?endpoint=' + endpoint + '&token=' + token, {
      method: 'GET'
    });
    console.log(response);
    const myJson = await response.json();
    console.log(myJson);
    return myJson;
  }
  async function getTemplateAvailable(endpoint, token, appKey) {
    const response = await fetch('/getTemplateList?endpoint=' + endpoint + '&token=' + token + '&appKey=' + appKey, {
      method: 'GET'
    });
    console.log(response);
    const myJson = await response.json();
    console.log(myJson);
    return myJson;
  }
  return {
    getAppAvailable: getAppAvailable,
    getTemplateAvailable: getTemplateAvailable
    }
});