import { beforeEach, describe, expect, it } from "vitest";
import { toast as sonnerToast } from "sonner";

import { useToast } from "@/components/ui/use-toast";

describe("useToast", () => {
  beforeEach(() => {
    sonnerToast.mockClear();
    sonnerToast.error.mockClear();
    sonnerToast.success.mockClear();
    sonnerToast.info.mockClear();
    sonnerToast.warning.mockClear();
    sonnerToast.dismiss.mockClear();
  });

  it("dispatches string toasts", () => {
    const { toast } = useToast();

    toast("Hello");

    expect(sonnerToast).toHaveBeenCalledWith("Hello");
  });

  it("maps variants and helper methods", () => {
    const { toast, success, error, info, warning, dismiss } = useToast();

    toast({
      title: "Default",
      description: "Body",
      duration: 1200,
    });
    toast({
      title: "Warn",
      description: "Heads up",
      duration: 2000,
      variant: "warning",
    });
    toast({
      title: "Info",
      description: "FYI",
      variant: "info",
    });
    toast({
      title: "Success",
      description: "Nice",
      variant: "success",
    });
    toast({
      title: "Error",
      description: "Oops",
      variant: "destructive",
    });

    success("Saved", { description: "All good", duration: 3000 });
    error("Failed", { description: "Try again" });
    info("Details", { description: "More info" });
    warning("Careful", { description: "Be aware" });
    dismiss();

    expect(sonnerToast).toHaveBeenCalledWith("Default", {
      description: "Body",
      duration: 1200,
    });
    expect(sonnerToast.warning).toHaveBeenCalledWith("Warn", {
      description: "Heads up",
      duration: 2000,
    });
    expect(sonnerToast.info).toHaveBeenCalledWith("Info", {
      description: "FYI",
      duration: undefined,
    });
    expect(sonnerToast.success).toHaveBeenCalledWith("Success", {
      description: "Nice",
      duration: undefined,
    });
    expect(sonnerToast.error).toHaveBeenCalledWith("Error", {
      description: "Oops",
      duration: undefined,
    });

    expect(sonnerToast.success).toHaveBeenCalledWith("Saved", {
      description: "All good",
      duration: 3000,
    });
    expect(sonnerToast.error).toHaveBeenCalledWith("Failed", {
      description: "Try again",
      duration: undefined,
    });
    expect(sonnerToast.info).toHaveBeenCalledWith("Details", {
      description: "More info",
      duration: undefined,
    });
    expect(sonnerToast.warning).toHaveBeenCalledWith("Careful", {
      description: "Be aware",
      duration: undefined,
    });
    expect(sonnerToast.dismiss).toHaveBeenCalledTimes(1);
  });
});
