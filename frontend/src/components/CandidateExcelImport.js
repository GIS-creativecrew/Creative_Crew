import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import BASE_URL from "../utils/baseurl";
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

const CandidateExcelImport = ({ onSuccess }) => {
  const [excelFile, setExcelFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("error");
  const [emailSent, setEmailSent] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleFileChange = (e) => {
    setExcelFile(e.target.files[0]);
    setPreview([]);
    setMessage("");
  };

  const handleCancel = () => {
    setExcelFile(null);
    setPreview([]);
    setMessage("");
  };

  const handlePreview = () => {
    if (!excelFile) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      setPreview(json);
    };
    reader.readAsArrayBuffer(excelFile);
  };

  const handleImport = async () => {
    if (!excelFile) return;
    // Always parse the file for import, even if preview not clicked
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      // Map Excel columns to backend keys
      const mapped = json.map((c) => ({
        first_name: c.first_name,
        last_name: c.last_name,
        email_id: c["Email id"] || c.email_id,
        phone_number: c["Mobile No"] || c.phone_number,
        applied_position: c["Position Applied"] || c.applied_position || "",
      }));
      // Validate required fields
      const valid = mapped.every(
        (c) => c.first_name && c.last_name && c.email_id && c.phone_number
      );
      if (!valid) {
        setMessage(
          "Each row must have first_name, last_name, email_id, phone_number."
        );
        setMessageColor("error");
        return;
      }
      try {
        await axios.post(`${BASE_URL}/api/candidates/register-bulk`, {
          candidates: mapped,
        });
        setMessage("Candidates imported successfully!");
        setMessageColor("success");
        setExcelFile(null);
        setPreview([]);
        if (onSuccess) onSuccess();
      } catch (err) {
        setMessage(err.response?.data?.message || "Import failed");
        setMessageColor("error");
      }
    };
    reader.readAsArrayBuffer(excelFile);
  };

  const handleSendEmail = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/candidates/send-registration-emails`
      );
      setMessage(res.data.message || "Email sent successfully!");
      setMessageColor("success");
      setEmailSent(true);
      setConfirmOpen(false);
    } catch (err) {
      setMessage("Failed to send emails.");
      setMessageColor("error");
      setConfirmOpen(false);
    }
  };

  return (
    <Box component={Paper} sx={{ p: 3, mb: 2, maxWidth: 700 }}>
      <Typography variant="h6" gutterBottom>
        Import Candidates from Excel
      </Typography>
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        style={{ marginBottom: 8 }}
      />
      <Button variant="outlined" onClick={handlePreview} disabled={!excelFile}>
        Preview
      </Button>
      <Button
        variant="contained"
        color="success"
        onClick={handleImport}
        sx={{ ml: 2 }}
        disabled={!excelFile}
      >
        Import
      </Button>
      <Button
        variant="outlined"
        color="error"
        onClick={handleCancel}
        sx={{ ml: 2 }}
        disabled={!excelFile && preview.length === 0}
      >
        Cancel Import
      </Button>
      <Typography color={messageColor} sx={{ mt: 2 }}>
        {message}
      </Typography>
      <Typography sx={{ mt: 2, fontSize: 13 }}>
        <b>Excel columns required:</b> first_name, last_name, email_id,
        phone_number, applied_position (optional)
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          if (emailSent) {
            setConfirmOpen(true);
          } else {
            handleSendEmail();
          }
        }}
        sx={{ ml: 2 }}
      >
        Send Email to Registered Candidates
      </Button>
      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Resend Email?</DialogTitle>
        <DialogContent>
          <Typography>
            Do you want to resend the email to all registered candidates?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleSendEmail} color="primary" variant="contained">
            Resend
          </Button>
        </DialogActions>
      </Dialog>
      {preview.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Preview:</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {Object.keys(preview[0]).map((key) => (
                    <TableCell key={key}>{key}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {preview.map((row, idx) => (
                  <TableRow key={idx}>
                    {Object.keys(preview[0]).map((key) => (
                      <TableCell key={key}>{row[key]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default CandidateExcelImport;
