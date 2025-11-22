"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PasswordChangingDialog({ openDialog, setOpenDialog }) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    const resetForm = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setError(null);
        setSuccessMsg(null);
    };

    const handleClose = () => {
        resetForm();
        setOpenDialog(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("Please fill all fields.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("New password and confirmation do not match.");
            return;
        }
        if (newPassword.length < 8) {
            setError("New password must be at least 8 characters.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("http://localhost:3001/api/v1/account/change-password", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    old_password: currentPassword,
                    new_password: newPassword,
                }),
            });

            if (res.ok) {
                setSuccessMsg("Password changed successfully.");
                console.log("Password changed successfully.");
                // auto close after short delay
                setTimeout(() => handleClose(), 900);
            } else {
                const data = await res.json().catch(() => ({}));
                setError(data?.message || data?.error || "Failed to change password.");
            }
        } catch (err) {
            console.error(err);
            setError("Network error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger>
                <div className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 cursor-pointer">Change password</div>
            </DialogTrigger>
            <DialogContent className="max-w-sm bg-white text-black">
                <DialogHeader>
                    <DialogTitle>Change password</DialogTitle>
                    <DialogDescription>Enter your current password and choose a new one.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4">
                    <label className="text-sm text-gray-700">Current password</label>
                    <Input type="password" onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />

                    <label className="text-sm text-gray-700">New password</label>
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />

                    <label className="text-sm text-gray-700">Confirm new password</label>
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />

                    {error && <div className="text-sm text-red-600">{error}</div>}
                    {successMsg && <div className="text-sm text-green-600">{successMsg}</div>}

                    <div className="flex gap-2 justify-end mt-2">
                        <Button variant="ghost" onClick={handleClose} disabled={loading}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
