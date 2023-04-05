import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import getUserImages from "./getUserImages";
import deleteImage from "./deleteUserImage";
import * as dotenv from "dotenv";
import getUserImageById from "./getUserImageById";

dotenv.config();

const httpTrigger: AzureFunction = async function (
    context: Context,
    req: HttpRequest
): Promise<void> {
    switch (req.method) {
        case "GET":
            if (req.params.imageId) {
                await getUserImageById(context, req);
            } else {
                await getUserImages(context, req);
            }
            break;
        case "DELETE":
            await deleteImage(context, req);
            break;
        default:
            context.res = {
                status: 400,
                body: "Invalid request method2.",
            };
    }
};

export default httpTrigger;
