// import sequelize from "./config/database.js";
// import OnboardingStep from "./models/OnboardingStep.js";
// import SystemCatalog from "./models/SystemCatalog.js";
// import IntegrationCatalog from "./models/IntegrationCatalog.js";
// import { connectDatabase } from "./config/database.js";
// import logger from "./utils/logger.js";

// const run = async () => {
//   try {
//     // Connect to database
//     await connectDatabase();
//     logger.info("Connected to database");
//     // Part 2: Add missing IntegrationCatalog entries for SystemCatalog systems
//     logger.info("Checking for missing IntegrationCatalog entries...");

//     // Fetch all SystemCatalog entries with their details
//     const allSystems = await SystemCatalog.findAll({
//       attributes: ["system_key", "display_name", "description"],
//       raw: true,
//     });

//     logger.info(`Found ${allSystems.length} systems in SystemCatalog`);

//     // Fetch all existing IntegrationCatalog entries
//     const existingIntegrations = await IntegrationCatalog.findAll({
//       attributes: ["system_key"],
//       raw: true,
//     });

//     const existingIntegrationSystemKeys = new Set(
//       existingIntegrations.map((i) => i.system_key)
//     );

//     logger.info(
//       `Found ${existingIntegrationSystemKeys.size} existing integrations in catalog`
//     );

//     // Find missing system keys (systems without corresponding integrations)
//     const missingIntegrationSystems = allSystems.filter(
//       (system) => !existingIntegrationSystemKeys.has(system.system_key)
//     );

//     logger.info(
//       `Found ${missingIntegrationSystems.length} systems missing from IntegrationCatalog:`,
//       missingIntegrationSystems.map((s) => s.system_key)
//     );

//     if (missingIntegrationSystems.length === 0) {
//       logger.info(
//         "No missing integrations found. All systems already have IntegrationCatalog entries."
//       );
//     } else {
//       // Create IntegrationCatalog entries for missing systems
//       const integrationEntriesToAdd = missingIntegrationSystems.map(
//         (system) => {
//           return {
//             integration_key: system.system_key, // Use system_key as integration_key
//             system_key: system.system_key,
//             display_name: system.display_name,
//             supports_automated_checks: false,
//             required_scopes: [],
//             auth_type: "oauth",
//             description:
//               system.description || `Integration for ${system.display_name}`,
//             recommended: false,
//           };
//         }
//       );

//       // Insert missing integration entries
//       for (const entry of integrationEntriesToAdd) {
//         try {
//           await IntegrationCatalog.create(entry);
//           logger.info(
//             `Added integration: ${entry.integration_key} - ${entry.display_name}`
//           );
//         } catch (error) {
//           if (error.name === "SequelizeUniqueConstraintError") {
//             logger.warn(
//               `Integration ${entry.integration_key} already exists, skipping`
//             );
//           } else {
//             logger.error(
//               `Error adding integration ${entry.integration_key}:`,
//               error.message
//             );
//           }
//         }
//       }

//       logger.info(
//         `Successfully processed ${integrationEntriesToAdd.length} missing integration entries`
//       );
//     }
//   } catch (error) {
//     logger.error("Error in script:", error);
//     throw error;
//   } finally {
//     await sequelize.close();
//     logger.info("Database connection closed");
//   }
// };

// // Run the script
// run()
//   .then(() => {
//     logger.info("Script completed successfully");
//     process.exit(0);
//   })
//   .catch((error) => {
//     logger.error("Script failed:", error);
//     process.exit(1);
//   });

// https://github.com/login/oauth/authorize?client_id=Ov23li4PcpDdFmKkZXxP&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fintegrations%2Fgithub%2Fcallback&scope=read%3Aorg+repo+workflow&state=d8043f449ac733389a1da2d9b9638192b868102be36530a4b84958a9ad809e2f
