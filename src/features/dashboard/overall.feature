Feature: Overall Dashboard

    @OverallAvailability
    Scenario: Select overall availability filter
        Given I select tenant "Thailand" when clicking "Flag of Ghana"
        And I click filter "overall-availability-section"
        And I selects "<option>" option on filter
        Examples:
            | option        |
            | Yara Farmcare |