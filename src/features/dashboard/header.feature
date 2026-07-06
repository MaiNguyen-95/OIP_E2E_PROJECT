Feature: Header dashboard


    @LogoVerification
    Scenario: Verify logo and app title
        Given I select tenant "Thailand" when clicking "Flag of Ghana"
        Then the logo should be displayed correctly
        And the logo text should be displayed correctly

    @UserInfoVerification
    Scenario Outline: Verify user info in header
        Given I select tenant "Thailand" when clicking "Flag of Ghana"
        Then the user name should display "<name>"
        And the user email should display "<email>"
        And the logout button should be visible

        Examples:
            | name       | email               |
            | Mai Nguyen | mai.nguyen@yara.com |