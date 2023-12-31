import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import axios from "axios";

type userImages = {
    url: string,
    name: string
}

export const FaceRecognitionRouter = createTRPCRouter({

    addImage: publicProcedure
        .input(z.object({ image: z.string(), id: z.number(), chunk: z.number(), chunkSize: z.number() }))
        .mutation(async ({ input, ctx }) => {
            try {
                await ctx.db.imageLog.create({
                    data: {
                        image: input.image,
                        imageId: input.id,
                        chunk: input.chunk,
                        chunkSize: input.chunkSize,
                        processed: false
                    }
                })
            } catch (error) {
                console.log(error);
                return error;
            }
        }),

    recognizeFace: protectedProcedure
        .input(z.object({ img: z.string(), images: z.array(z.string()) }))
        .mutation(({ input }) => {
            try {
                const json = JSON.stringify(input);
                console.log(json);
                // const response = await axios.post("https://recognition-api-iota.vercel.app/getImg",{img: input});
            } catch (error) {
                console.log(error);
            }
        }),

    recognize: publicProcedure
        .input(z.object({ id: z.number(), userId: z.string() }))
        .mutation(async ({ input, ctx }) => {

            const getRawImage = async () => {
                try {
                    const images = await ctx.db.imageLog.findMany({
                        where: {
                            processed: false,
                            imageId: input.id
                        },
                        orderBy: {
                            chunk: "asc"
                        }
                    })

                    let img = "";
                    images.forEach((image) => {
                        img += image.image;
                    })
                    //quitar b' al inicio y el \\n al final
                    const cropped = img.substring(2, img.length - 3);
                    console.log(cropped);
                    
                    return cropped;

                    // const img = images.map((image) => {
                    //     return image.image;
                    // })



                } catch (error) {
                    console.log(error);
                    return error;
                }
            }

            const getUserImages = async () => {
                try {
                    const imgs = await ctx.db.image.findMany({
                        where: {
                            userId: input.userId
                        },
                        select: {
                            url: true,
                            name: true
                        }

                    })

                    // let result: userImages[] = [];

                    // imgs.forEach((img) => {
                    //     result.push(img);
                    // })
                    // console.log(result)
                    return imgs;

                } catch (error) {
                    console.log(error);
                    return error;
                }
            }

            const fetchData = async (img: string, images: userImages[]) => {
                console.log("fetching data")
                try {
        
                    
                    const response = await axios.post("https://ale-api.roborregos.com/recognize", {
                        img: img,
                        images: images
                    });
                    // const data = await response.json();
                    // console.log(response.data.result);
                    return response.data.result as string;
                    // if (response.data.result)
                    //     return response.data.result as string;
                    // else return response.data as string;

                } catch (error) {
                    console.log(error);
                    return error;
                }

            }

            const images = await getUserImages();
            const imagesResult = z.array(z.object({ url: z.string(), name: z.string() })).parse(images);
            const img = await getRawImage();
            const imgResult = z.string().parse(img);
            // const imgResult = "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"

            const result = await fetchData(imgResult, imagesResult);

            const resultName = z.string().parse(result);
            // const date = Date.now().toString(); 
            const date = new Date().toDateString();
            const time = new Date().toTimeString();

            await ctx.db.log.create({
                data: {
                    name: resultName,
                    date: date,
                    time: time,
                    image: imgResult,
                    userId: input.userId
                }
            })
            // console.log(imgResult);
            // console.log(imagesResult);

            return result;


            // return -1;
        }),

        getLogs: protectedProcedure
            .input(z.object({userId: z.string()}))
            .query(async ({ ctx, input}) => {
                return await ctx.db.log.findMany({
                    where: {
                        userId: input.userId
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                })
            }),

        deleteLog: publicProcedure
            .input(z.object({id: z.number()}))
            .mutation(async ({ ctx, input }) => {

                await ctx.db.log.deleteMany({
                    where: {
                        id: input.id
                    }
                });
                return true;
            }),

       
        
        deletePrev: publicProcedure
            .input(z.object({id: z.number()}))
            .mutation(async ({ ctx, input }) => {

                await ctx.db.imageLog.deleteMany({
                    where: {
                        imageId: input.id
                    }
                });
                return true;
            })

})