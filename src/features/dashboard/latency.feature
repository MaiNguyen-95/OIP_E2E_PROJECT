Feature: Latency on Dashboard

    @verifylatencywithfilter
    Scenario Outline: Latency
        Given I select tenant "Thailand" when clicking "Flag of Ghana"
        And I click filter "latency-section"
        And I selects "<option>" option on filter
        And I select "<timerange>" timerange "latency-section"
        Then I verify both "<P95>" and "<P99>" latency metrics for "<timerange>" timerange on card "<meanlatency>" match API
        Examples:
            | option       | timerange | meanlatency       | P95  | P99  |
            | Yara Connect | 7d        | mean-latency-card | 95th | 99th |


    @verifypopuptopservicesopen
    Scenario: Open popup top services latency
        Given I select tenant "Thailand" when clicking "Flag of Ghana"
        And From "<datatestid>" I click "<text>"
        Then I verify popup is "open"
        Examples:
            | datatestid      | text              |
            | latency-section | View all services |


    @verifypopuptopservicesclosed
    Scenario: Close popup top services latency
        Given I select tenant "Thailand" when clicking "Flag of Ghana"
        And From "<datatestid>" I click "<text>"
        And I verify popup is "open"
        And I click to "<btnclose>" button to close popup Services latency
        Then I verify popup is "closed"
        Examples:
            | datatestid      | text              | btnclose |
            | latency-section | View all services | Close    |


    @verifylistAPIofservice
    Scenario: List API of service
        Given I select tenant "Thailand" when clicking "Flag of Ghana"
        And From "<datatestid>" I click "<text>"
        And I click to expand list of service at "<api>"
        And I click to "<btnclose>" button to close popup Services latency
        Then I verify popup is "closed"
        Examples:
            | datatestid      | text              | api        | btnclose |
            | latency-section | View all services | yc-loyalty | Close    |
