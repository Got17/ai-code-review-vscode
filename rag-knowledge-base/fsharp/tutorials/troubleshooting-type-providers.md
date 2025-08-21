# Troubleshooting Type Providers
This topic describes and provides potential solutions for the problems that you are most likely to encounter when you use type providers.

## Possible Problems with Type Providers
If you encounter a problem when you work with type providers, you can review the following table for the most common solutions.

| Problem | Suggested Actions |
| --- | --- |
| **Schema Changes** – Type providers work best when the data source schema is stable. If you add a data table or column or make another change to that schema, the type provider doesn’t automatically recognize these changes. | Clean or rebuild the project. To clean: **Build** → **Clean** _ProjectName_. To rebuild: **Build** → **Rebuild** _ProjectName_. This resets all type provider state and forces it to reconnect to the data source and obtain updated schema information. |
| **Connection Failure** – The URL or connection string is incorrect, the network is down, or the data source/service is unavailable. | For web or OData services, test the URL in a browser. For databases, use **Server Explorer** to verify the connection string and database availability. After restoring the connection, clean or rebuild the project to force reconnection. |
| **Not Valid Credentials** – You must have valid permissions for the data source or web service. | For SQL: Ensure the username/password in the connection string or config file are valid. For Windows Authentication: Ensure you have database access. The DBA can confirm required permissions. For web/data services: Set the `Credentials` property in the `DataContext` with the correct username and access key. |
| **Not Valid Path** – A path to a file was not valid. | Verify the path is correct and the file exists. Quote backslashes properly or use a verbatim string/triple-quoted string. |

> Reference: https://learn.microsoft.com/en-us/dotnet/fsharp/tutorials/type-providers/troubleshooting-type-providers
