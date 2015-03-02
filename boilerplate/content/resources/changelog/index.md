---
layout: sidebar
showHeadings: false
---

# {{ stache.config.product_name_short }} API Change Log

We periodically update the API in order to deliver new features and to repair defects discovered in previous versions.  In most cases, these changes will be transparent to API developers.  However, occasionally we need to make changes that require developers to modify their existing applications.  

## Release 2015-10-12 (Oct 12, 2015)

### Added
- All collections now include an empty list for the property when the collection contains no resources. Previously the  property would be omitted from the response. See the API Reference for complete details on queries and responses for API data.

- The *prospect status* property is now available within the [Constituent][constituent] resource.  
[Learn more option 1...][option1] [Learn more option 2...][option2]

### Bug Fix
- Fix for [Issue 4][issue4] - On the Proposals resource, the "Date Last Changed" property now correctly displays the correct date. [Learn more...][issue4-blog]

## Release 2014-06-01 (June X, 2015)

This is the beta release of the RE NXT API!

### New Endpoints

New RESTful endpoints have been created to simplify accessing RE NXT constituent data:

- Constituent 
- Addresses
- Email
- Attributes
- Constituent Codes
- Notes
- ...

### New Documentation

New [docs] have been created to describe how the new Management API works.


[docs]: http://blackbaud-community.github.io/developer.blackbaud.com-renxt/
[constituent]: https://bbbobbyearl.portal.azure-api.net/docs/services/5489b7687376d0092c2d38a1/operations/5489b76a7376d00b90cb19ff
[option1]: http://blackbaud.smallworldlabs.com/groups/blogpost/view/29/34/38
[option2]: /resources/blog/home/2015/01/14/new-constituent-field-prospect-status/
[issue4]: https://bbbobbyearl.portal.azure-api.net/Issues/4
[issue4-blog]: /resources/blog/home/2015/10/12/date-last-changed-fixed/
