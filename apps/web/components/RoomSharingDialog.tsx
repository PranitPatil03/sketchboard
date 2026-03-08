'use client'

import { useState } from "react";
import { Button } from "./ui/button";
import { Copy, LogOut, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

export function RoomSharingDialog({ open, onOpenChange, link, isRoomAdmin, onStopSession, onLeaveRoom }: { open: boolean, onOpenChange: (open: boolean) => void, link: string, isRoomAdmin: boolean, onStopSession?: () => void, onLeaveRoom?: () => void }) {
    const roomLink = link;
    const [showStopConfirm, setShowStopConfirm] = useState(false);

    const copyRoomLink = async () => {
        try {
            await navigator.clipboard.writeText(roomLink);
            toast({ title: "Link copied to clipboard!" });
        } catch (error) {
            toast({ title: "Failed to copy link", variant: "destructive" });
            console.error('Failed to copy link:', error);
        }
    };

    const handleStopSession = () => {
        setShowStopConfirm(true);
    };

    const confirmStopSession = () => {
        setShowStopConfirm(false);
        onOpenChange(false);
        if (isRoomAdmin && onStopSession) {
            onStopSession();
        } else if (onLeaveRoom) {
            onLeaveRoom();
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="font-[family-name:var(--font-geist-sans)] glass-panel gap-6 max-w-lg bg-island-bg-color border border-dialog-border-color shadow-modal-shadow rounded-lg p-10" overlayClassName="bg-[#12121233]">
                    <DialogHeader className="gap-6">
                        <DialogTitle className="flex items-center justify-center w-full font-bold text-xl text-color-primary tracking-[0.75px]">Live collaboration</DialogTitle>
                        <div className="text-text-primary-color my-4">
                            <p className="font-semibold mb-2">Link</p>
                            <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                                <div className="bg-collaby-textfield border border-collaby-textfield rounded-md px-3 py-2 text-text-primary-color truncate">
                                    {roomLink}
                                </div>
                                <Button
                                    onClick={copyRoomLink}
                                    className="py-2 px-6 rounded-md text-[.875rem] font-semibold shadow-none bg-color-primary hover:bg-brand-hover active:bg-brand-active active:scale-[.98] flex-nowrap"
                                    title="Copy link"
                                    size={"lg"}
                                >
                                    <Copy className="w-5 h-5" /> Copy Link
                                </Button>
                            </div>
                        </div>

                        <div className="text-text-primary-color text-[.875rem] leading-[150%] font-light my-4 max-w-full">
                            <div className="flex items-start mb-4">
                                <span className="mr-2">🔒</span>
                                <span>This session is end-to-end encrypted and fully private. Your drawings never leave your device unprotected.</span>
                            </div>

                            <div className="mt-4">
                                {isRoomAdmin
                                    ? "Stopping the session will disconnect all participants from the room and end the collaboration."
                                    : "Leaving the room will disconnect you. Other participants can continue collaborating."}
                            </div>
                        </div>
                    </DialogHeader>

                    <DialogFooter className="flex items-center justify-center sm:justify-center">
                        <Button
                            onClick={handleStopSession}
                            className="py-2 px-6 min-h-12 rounded-md text-[.875rem] font-semibold shadow-none bg-red-500 hover:bg-red-600 active:bg-red-700 active:scale-[.98] text-white"
                        >
                            {isRoomAdmin ? (
                                <><X className="w-5 h-5 mr-2" /> Stop session</>
                            ) : (
                                <><LogOut className="w-5 h-5 mr-2" /> Leave room</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showStopConfirm} onOpenChange={setShowStopConfirm}>
                <AlertDialogContent className="font-[family-name:var(--font-geist-sans)]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {isRoomAdmin ? "Stop collaboration session?" : "Leave collaboration room?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {isRoomAdmin
                                ? "This will disconnect all participants and end the session. The room will be closed."
                                : "This will disconnect you from the room. You can rejoin later using the same link."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmStopSession} className="bg-red-500 hover:bg-red-600">
                            {isRoomAdmin ? "Stop session" : "Leave room"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}