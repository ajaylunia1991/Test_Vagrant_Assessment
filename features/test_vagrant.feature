Feature: Test Vagrant Assignment

Scenario: Verify weather of Gwalior city is displayed
  Given I go to NDTV website
  When I open the weather page
  * I search temperature of city: Gwalior
  Then I should see Gwalior city on map with its temperature


Scenario: Get weather details of city via API
   When I fetch the weather details using host: api.openweathermap.org, path: /data/2.5/weather and city: Gwalior
   Then I should match the temperature with NDTV website as per variance condition



