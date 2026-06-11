import { useState, useEffect } from "react";
import axios from "axios";

function ConfirmationModal({ isOpen, lead, onClose, showToast }) {
  const [messageBody, setMessageBody] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (lead) {
      const name = lead.name || "Customer";
      const property = lead.property_name || "Prestige Towers";
      const date = lead.visitDate || lead.visit_date || "20 June 2026";
      
      // Default template
      const defaultText = `Hi ${name}, Aura here! Confirming your scheduled site visit for ${property} on ${date}. See you soon! 🏠`;
      setMessageBody(defaultText);
    }
  }, [lead]);

  if (!isOpen || !lead) return null;

  const handleSend = async (channel) => {
    setSending(true);
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/call/send-confirmation", {
        phone: lead.phone,
        name: lead.name,
        property_name: lead.property_name || "Prestige Towers",
        visit_date: lead.visitDate || lead.visit_date || "20 June 2026",
        channel: channel,
        message_body: messageBody
      });

      if (response.data.success) {
        showToast(response.data.message || `Confirmation sent via ${channel.toUpperCase()}!`, "success");
        onClose();
      } else {
        // Specific checks for Twilio Trial constraints
        let errorMsg = response.data.error || "Failed to send message.";
        if (errorMsg.includes("21608")) {
          errorMsg = "Twilio Trial Limit: The destination phone number is not verified. Please verify it in your Twilio Console first.";
        } else if (errorMsg.includes("63030") || errorMsg.includes("sandbox")) {
          errorMsg = "Twilio Sandbox Limit: The recipient must opt-in by sending 'join <sandbox-keyword>' to your sandbox number first.";
        } else if (errorMsg.includes("63007") || errorMsg.includes("From address") || errorMsg.includes("Channel")) {
          errorMsg = "Twilio Sandbox Limit: WhatsApp Sandbox is not activated. Go to your Twilio Console, select 'Messaging -> Try it out -> Send a WhatsApp Message', and follow instructions to activate your Sandbox.";
        }
        showToast(errorMsg, "error");
      }
    } catch (error) {
      console.error("Error sending confirmation", error);
      showToast("Network error. Backend connection failed.", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <h2>Send Confirmation ✉️</h2>
          <button className="confirm-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="confirm-modal-body">
          <div className="confirm-modal-field">
            <span className="confirm-modal-label">Lead Details</span>
            <div className="confirm-modal-value">
              <b>{lead.name}</b> ({lead.phone})
            </div>
          </div>
          <div className="confirm-modal-field">
            <span className="confirm-modal-label">Edit Message Template</span>
            <textarea
              className="confirm-modal-textarea"
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              disabled={sending}
            />
          </div>
        </div>
        <div className="confirm-modal-actions">
          <button className="confirm-modal-btn confirm-modal-btn-cancel" onClick={onClose} disabled={sending}>
            Cancel
          </button>
          <button
            className="confirm-modal-btn confirm-modal-btn-sms"
            onClick={() => handleSend("sms")}
            disabled={sending}
          >
            {sending ? "Sending..." : "Send SMS 📱"}
          </button>
          <button
            className="confirm-modal-btn confirm-modal-btn-whatsapp"
            onClick={() => handleSend("whatsapp")}
            disabled={sending}
          >
            {sending ? "Sending..." : "Send WhatsApp 💬"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
