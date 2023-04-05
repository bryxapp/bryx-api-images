import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import newImage from "./newImage";
import * as dotenv from 'dotenv';

dotenv.config();

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    if (req.method === "POST") {
        await newImage(context, req);
    }
    else {
        context.res = {
            status: 400,
            body: "Invalid request method."
        };
    }
};

export default httpTrigger;