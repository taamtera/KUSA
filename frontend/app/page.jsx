"use client";

import { SettingsApplications } from "@mui/icons-material";
import { Card, CardContent, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

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
      <Card
        className="flex basis-full"
        sx={{
          borderRadius: 3,
          background: "#dbdce1",
        }}
        elevation={5}
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
              gutt
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
              sx={{
                color: "#0e0b0e",
                fontWeight: 350,
              }}
              className="flex justify-center"
            >
              <p class="text-[48px] mt-24">
                Welcome to KUSA
              </p>
            </Typography>
            <Typography
              sx={{
                color: "#0e0b0e",
                fontWeight: 350,
              }}
              className="flex justify-center"
            >
              <p class="text-[48px]">
                A social media platform for KU
              </p>
            </Typography>
            <div class="mt-24">
              <img class="float-left ml-100" src="/ex-server.png" alt="Server Demo" />
              <img class="float-right mr-100" src="/ex-profile.png" alt="Profile Demo" />
            </div>
            <Typography
              sx={{
                color: "#0e0b0e",
                fontWeight: 350,
              }}
              className="flex justify-center"
            >
              <p class="text-[24px] text-center mt-12">
              KUSA aims to provide a KU social media and chat platform, allowing users to interact in servers, chat rooms, and private messaging spaces with a focus on usability, privacy, and multimedia support
              </p>
            </Typography>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
