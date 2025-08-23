"use client";

import { SettingsApplications } from "@mui/icons-material";
import { Card, CardContent, Typography } from "@mui/material";
import { useState, useEffect } from "react";

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
    <div className="flex min-h-screen p-8 pb-20 gap-16 sm:p-20 max-w-400 mx-auto">
      <Card
        className="flex basis-full items-center"
        sx={{
          borderRadius: 3,
          background: "linear-gradient(120deg, #2a004aff 5% , #14408bff 100%)",
        }}
        elevation={5}
      >
        <div className="basis-full justify-items-center">
          <CardContent>
            <Typography
              variant="h3"
              sx={{
                color: "#ffffffff",
                fontWeight: 200,
                letterSpacing: "0.2em",
              }}
              gutt
            >
              KUSA
            </Typography>
            <Typography
              sx={{
                color: "#a4c7ffe6",
                fontWeight: 400,
              }}
            >
              Kaseatsart University Social App
            </Typography>
            {/* Backend Status */}
            <Typography sx={{ fontWeight: 400 }}>
              <span style={{ color: "#a4c7ffe6" }}>Backend :</span>{" "}
              <span
                style={{
                  color: backend_status ? "#a4c7ffe6" : "#ffa4a4e6",
                }}
              >
                {backend_status ? "Online" : "Offline"}
              </span>
            </Typography>
            {/* db status */}
            <Typography sx={{ fontWeight: 400 }}>
              <span style={{ color: "#a4c7ffe6" }}>Database :</span>{" "}
              <span
                style={{
                  color: db_status ? "#a4c7ffe6" : "#ffa4a4e6",
                }}
              >
                {db_status ? "Online" : "Offline"}
              </span>
            </Typography>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
