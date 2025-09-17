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
        className="flex basis-full items-center"
        sx={{
          borderRadius: 3,
          background: "#dbdce1",
        }}
        elevation={5}
      >
        <div className="basis-full justify-items-center">
          <CardContent>
            <Typography
              variant="h3"
              sx={{
                color: "#0e0b0e",
                fontWeight: 200,
                letterSpacing: "0.2em",
              }}
              gutt
              className="flex justify-center"
            >
              KUSA
            </Typography>
            <Typography
              sx={{
                color: "#0e0b0e",
                fontWeight: 400,
              }}
              className="flex justify-center"
            >
              Kaseatsart University Social App
            </Typography>
          </CardContent>
          <div className="flex flex-wrap items-center justify-center gap-2 md:flex-row">
            <a href="/login">
            <Button 
            className="flex w-64 my-4 shadow-xl cursor-pointer"
            >
              Log in</Button></a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 md:flex-row">
            <Button className="flex w-64 shadow-xl cursor-pointer">Create account</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
