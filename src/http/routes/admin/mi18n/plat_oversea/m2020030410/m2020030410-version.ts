import { Request, Response } from "express";

// Example request:
// {
//     "version": 54
// }


export default function handle(req: Request, res: Response) {
    // Test handler
    res.send({
        version: 54
    });
}