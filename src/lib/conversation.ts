import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";

export const generateConversationId = () => {
  const datePrefix = format(new Date(), "yyyyMMddHHmmss");
  const uniqueId = uuidv4();
  return `${datePrefix}-${uniqueId}`;
};

export const isValidConversationId = (id: string): boolean => {
  // Check if string matches pattern: 14 digits followed by hyphen and UUID
  const pattern =
    /^\d{14}-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return pattern.test(id);
};
