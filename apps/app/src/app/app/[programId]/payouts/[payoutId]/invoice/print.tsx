"use client";

import { Button } from "@leadxmedia/ui";
import { Printer } from "@leadxmedia/ui/icons";

export function PrintButton() {
  return (
    <Button onClick={() => window.print()}>
      <Printer /> Print or save as PDF
    </Button>
  );
}
