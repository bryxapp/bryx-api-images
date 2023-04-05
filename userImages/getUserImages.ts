import { Context, HttpRequest } from "@azure/functions";
import { getDatabase } from "../utils/database";
import { hashUserId } from "../utils/hash";

const getUserImages = async (context: Context, req: HttpRequest): Promise<void> => {
    try {

        if (!req.query.userId) {
            context.res = {
                status: 400,
                body: "Please pass a userId on the query string"
            };
            return;
        }

        const userId = hashUserId(req.query.userId);

        //Get the database connection
        const container = await getDatabase();

        //Create Cosmos DB query for users images
        const querySpec = {
            query: "SELECT * FROM c WHERE c.user = @userId ORDER BY c._ts DESC",
            parameters: [
                {
                    name: "@userId",
                    value: userId
                }
            ]
        }


        //Fetch the estimates
        const { resources: userImages } = await container.items.query(querySpec).fetchAll();

        context.res = {
            status: 200,
            body: userImages
        };

    } catch (error) {
        context.res = {
            status: 500,
            body: error.message
        };
    }
};

export default getUserImages;