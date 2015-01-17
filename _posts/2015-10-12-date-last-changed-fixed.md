---
---

For the upcoming release, the date last changed field on the proposals resource was returning an incorrectly formatted date.  Our engineers were able to determine the root cause, including researching ISO date standards for those that may be interested.  We've closed the [original issue][issue] as well as documented the change in our [change log][changelog].

[issue]: https://bbbobbyearl.portal.azure-api.net/Issues/4
[changelog]: {{ '/resources/changelog/' | prepend: site.baseurl }}