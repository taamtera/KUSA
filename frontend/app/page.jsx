"use client";

import { SettingsApplications } from "@mui/icons-material";
import { Card, CardContent, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import exProfile from "@/components/img/ex-profile.png";
import exServer from "@/components/img/ex-server.png";
import dmBob from "@/components/img/ex-dm-bob.png";
import profileAlice from "@/components/img/ex-profile-alice.png";
import genHubServer from "@/components/img/ex-server-genhub.png";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

export default Home;
function Home() {
    const [backend_status, setBackendStatus] = useState(false);
    const [db_status, setDbStatus] = useState(false);

    //   app.get('/', async (req, res) => {
    //     console.log("Health check received");
    //     let data = { backend: true, database: db_status };
    //     res.send(data);
    // });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("http://localhost:3001/");
                if (response.ok) {
                    const data = await response.json();
                    setBackendStatus(Boolean(data.backend));
                    setDbStatus(Boolean(data.database));
                }
            } catch (e) {
                console.error("Error fetching backend status:", e);
            }
        };
        fetchData();
    }, [backend_status, db_status]);

    return (
        <div className="flex min-h-screen">
            <div className="fixed inset-0 -z-10 pointer-events-none bg-gradient-to-b from-white via-50% via-white to-blue-200">
                <div
                    className="absolute inset-0 top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white via-20% via-white to-blue-100"
                    style={{
                        transform: "skewY(-7deg)",
                        transformOrigin: "top left",
                    }}
                />
            </div>


            <Card
                className="flex basis-full z-50"
                // background see through
                style={{ background: "rgba(255, 255, 255, 0.2)" }}
            >

                <div className="flex justify-end gap-4 absolute top-4 right-4 z-50">
                    <a href="/login">
                        <Button className="flex w-40 shadow-xl cursor-pointer">Log in</Button>
                    </a>
                    <a href="/register">
                        <Button className="flex w-40 shadow-xl cursor-pointer">Create account</Button>
                    </a>
                </div>


                <div className="basis-full">
                    <CardContent>
                        {/* KUSA logo */}
                        <div className="pt-4 pl-4 mb-6">
                            <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
                                KUSA
                            </div>
                        </div>

                        <Typography
                            variant="h3"
                            className="flex justify-center text-center !text-[90px] pt-10 !font-bold"
                        >
                            KUSA
                        </Typography>

                        <Typography
                            variant="h3"
                            className="flex justify-center text-center !text-[30px]"
                        >
                            A social media platform for KU
                        </Typography>

                        <Typography
                            sx={{
                                color: "#0e0b0e",
                                fontWeight: 350,
                            }}
                            className="flex justify-center w-full"
                        >
                            <p className="text-[20px] text-left mt-12 px-4 md:px-20 lg:px-40 text-gray-700">
                                In modern university environments, students and staff require seamless communication platforms to collaborate, socialize, and share information efficiently. Existing solutions often lack integration, are not tailored for the KU community, or do not provide privacy and role-based access control suitable for academic settings.
                            </p>
                        </Typography>

                        <div className="flex flex-col md:flex-row justify-center items-center w-full gap-8">
                            <div className="flex justify-center items-center w-full md:w-1/2">
                                <Carousel
                                    opts={{ align: "start" }}
                                    orientation="horizontal"
                                    className="w-full max-w-xs sm:max-w-sm md:max-w-md"
                                >
                                    <CarouselContent className="-mt-1 h-[200px]">
                                        <CarouselItem className="rounded-md border flex justify-center">
                                            <Image width={300} height={100} src={exProfile} alt="Profile Demo" className="oject-contain" />
                                        </CarouselItem>

                                        <CarouselItem className="rounded-md border flex justify-center">
                                            <Image width={300} height={100} src={profileAlice} alt="Alice Profile Demo" className="oject-contain" />
                                        </CarouselItem>

                                        <CarouselItem className="rounded-md border flex justify-center">
                                            <Image width={300} height={100} src={dmBob} alt="Bob Chat Demo" className="oject-contain" />
                                        </CarouselItem>

                                        <CarouselItem className="rounded-md border flex justify-center">
                                            <Image width={300} height={100} src={genHubServer} alt="General Hub Demo" className="oject-contain" />
                                        </CarouselItem>

                                        <CarouselItem className="rounded-md border flex justify-center">
                                            <Image width={300} height={100} src={exServer} alt="Server Demo" className="oject-contain" />
                                        </CarouselItem>
                                    </CarouselContent>
                                    <CarouselPrevious className="bg-black text-gray-50 hover:bg-gray-50 hover:text-black" />
                                    <CarouselNext className="bg-black text-gray-50 hover:bg-gray-50 hover:text-black" />
                                </Carousel>
                            </div>

                            <div className="w-full md:w-1/2">
                                <p className="text-[20px] text-left mt-12 px-6 md:px-20 lg:px-40 text-gray-700">
                                    ● KUSA aims to provide a KU social media and chat platform, allowing users to interact in servers, chat rooms, and private messaging spaces with a focus on usability, privacy, and multimedia support.
                                    <br />
                                    ● Additionally, it will integrate academic data such as class schedules and student codes to enhance connectivity and community engagement within Kasetsart University.
                                </p>
                            </div>
                        </div>

                    </CardContent>
                </div>
            </Card>
        </div>
    );
}
