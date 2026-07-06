Feature: Overall on Dashboard

    @OverallAvailability
    Scenario Outline: Verify uptime colors for each DVCS option
        Given I select tenant "Thailand" when clicking "Flag of Ghana"
        And I click filter "overall-availability-section"
        And I selects "<option>" option on filter
        Then all uptime period colors should match their percentage thresholds

        Examples:
            | option              |
            | All DVCS            |
            | Yara Connect        |
            | Yara Farmcare       |
            | Admin Portal Webapp |
            | Heartbeat           |