import React from "react";

type AvatarProps = {
  avatarUrl?: string;
  userName: string;
  onlineStatus?: boolean;
  width: string;
  alt?: string;
  onlineStatusWidth?: string;
  fontSize?: string;
};

export const Avatar = ({
  avatarUrl,
  userName,
  onlineStatus,
  width,
  alt,
  onlineStatusWidth = "40%",
  fontSize = "1.125rem",
}: AvatarProps) => {
  return (
    <div style={{ width: width, height: width }} className="relative">
      {onlineStatus !== undefined && (
        <div
          className="absolute rounded-full border-2 border-white bottom-0 -right-0.5"
          style={{
            backgroundColor: onlineStatus ? "#1dbf73" : "#a6a5a5",
            width: onlineStatusWidth,
            height: onlineStatusWidth,
          }}
        />
      )}
      {avatarUrl ? (
        <img src={avatarUrl} alt={alt} className="w-full h-full rounded-full" />
      ) : (
        <div className="w-full bg-no_focus h-full rounded-full flex items-center justify-center">
          <p
            className="text-off_white font-medium"
            style={{ fontSize: fontSize }}
          >
            {userName[0].toUpperCase()}
          </p>
        </div>
      )}
    </div>
  );
};
