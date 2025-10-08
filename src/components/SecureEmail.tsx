import { useEmailVisibility, maskEmail } from "@/hooks/useEmailVisibility";
import { EyeOff } from "lucide-react";

interface SecureEmailProps {
  email: string;
  userId: string;
  className?: string;
  showIcon?: boolean;
}

/**
 * Component that displays an email address with proper security filtering
 * Only shows full email to authorized users (owner and admins)
 */
export function SecureEmail({ email, userId, className = "", showIcon = true }: SecureEmailProps) {
  const { canViewEmail } = useEmailVisibility(userId);
  const displayEmail = canViewEmail ? email : maskEmail(email);

  return (
    <span className={`flex items-center gap-2 ${className}`}>
      {displayEmail}
      {!canViewEmail && showIcon && (
        <span title="Email hidden for privacy">
          <EyeOff className="h-3 w-3 text-muted-foreground" />
        </span>
      )}
    </span>
  );
}
