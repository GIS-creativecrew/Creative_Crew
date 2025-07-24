import React from "react";
import { Typography } from "@mui/material";

const AutoScheduleTable = ({ result }) => {
  if (!result) return null;
  return (
    <div>
      <Typography variant="h6" color="success.main">
        {result.message} ({result.count} interviews scheduled)
      </Typography>
    </div>
  );
};

export default AutoScheduleTable;
