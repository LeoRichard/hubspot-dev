/**
 * Copy parent companies properties to their childs companies. 
 * Example property used: city
 * The trigger of the workflow should be when "City is known" (with reenrollment) and "Parent company is unknown" and "Number of secondary companies is greater than 0"
 * With this conditions, only parent companies will enroll on the workflow.
 */
const hubspot = require('@hubspot/api-client');

exports.main = async (event, callback) => {

  // Define Hubspot client
  const hubspotClient = new hubspot.Client({
    accessToken: process.env.Secreto // Change "Secreto" with your Secret name
  });
  
  // Init variables
  const city = event.inputFields['city'];
  const properties = { "city": city }
  const SimplePublicObjectInput = { properties };
  let output = "Updated companies: ";

  // Start main logic
  try {

    // Get company childs
    const ApiResponse = await hubspotClient.crm.companies.associationsApi.getAll(event.object.objectId, "company");
    
    // For each child...
    ApiResponse.body.results.forEach( async(item) => {
      try {
        output += item.id + ", ";
        const apiResponse = await hubspotClient.crm.companies.basicApi.update(item.id, SimplePublicObjectInput); // Use CRM Company API: https://developers.hubspot.com/docs/api/crm/companies
        
        // Logs
        console.log("Company ID: " + apiResponse.body.id + ", City updated: " + apiResponse.body.properties.city);

      } catch (e) {
          e.message === "HTTP Request Failed" ?
              console.error(JSON.stringify(e.response, null, 2)) :
              console.error(e)
      }
    })
  } catch (err) {
    console.log("Error looking for child companies")
    console.error(err);
    throw err;
  }

  callback({
    outputFields: {
      company_childs: output // You need to also define output in the action output variables settings
    }
  });
}