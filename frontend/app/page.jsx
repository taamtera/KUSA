"use client";

import { SettingsApplications } from "@mui/icons-material";
import { Card, CardContent, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import exProfile from "@/components/img/ex-profile.png";
import exServer from "@/components/img/ex-server.png";

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
      <div className="absolute inset-0 bg-gradient-to-b from-white via-50% via-white to-blue-200">
        <div
          className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white via-20% via-white to-blue-100"
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
        {/* Login Button */}
        <div className="flex flex-wrap absolute top-0 right-50 gap-2 md:flex-row">
          <a href="/login">
          <Button 
          className="flex w-40 my-4 shadow-xl cursor-pointer"
          >
            Log in</Button></a>
        </div>
        {/* Create account Button */}
        <div className="flex flex-wrap absolute top-4 right-4 gap-2 md:flex-row">
          <a href="/register">
            <Button 
            className="flex w-40 shadow-xl cursor-pointer"
            >
              Create account</Button></a>
        </div>
        <div className="basis-full">
          <CardContent>
            <Typography
              variant="h3"
              sx={{
                color: "#0e0b0e",
                fontWeight: 200,
                letterSpacing: "0.2em",
              }}
              gutt="true"
              className="flex"
            >
              KUSA
            </Typography>
            <Typography
              sx={{
                color: "#0e0b0e",
                fontWeight: 400,
              }}
              className="flex"
            >
              Kasetsart University Social App
            </Typography>
            <Typography
              variant="h3"
              className="flex justify-center text-center text-[48px] pt-10"
            >
                Welcome to KUSA
                <br />
                A social media platform for KU
            </Typography>
            <div className="mt-12">
              <Image className="float-left ml-100" width={300} height={100} src={exServer} alt="Server Demo" />
              <Image className="float-right mr-100" width={300} height={100} src={exProfile} alt="Profile Demo" />
            </div>
            <Typography
              sx={{
                color: "#0e0b0e",
                fontWeight: 350,
              }}
              className="flex justify-center w-full"
            >
              <p className="text-[20px] text-left n
            mt-12 px-40 text-gray-700">
                In modern university environments, students and staff require seamless communication platforms to collaborate, socialize, and share information efficiently. Existing solutions often lack integration, are not tailored for the KU community, or do not provide privacy and role-based access control suitable for academic settings.
                <br /><br />
                KUSA aims to provide a KU social media and chat platform, allowing users to interact in servers, chat rooms, and private messaging spaces with a focus on usability, privacy, and multimedia support. Additionally, it will integrate academic data such as class schedules and student codes to enhance connectivity and community engagement within Kasetsart University.

              </p>
            </Typography>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
