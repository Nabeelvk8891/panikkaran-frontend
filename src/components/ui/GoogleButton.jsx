import { GoogleLogin } from "@react-oauth/google";

export default function GoogleButton({ onSuccess }) {
  return (
    <div className="mt-4 flex justify-center">
      <GoogleLogin
        onSuccess={onSuccess}
        onError={() => {
          console.error("Google Login Failed");
        }}
        useOneTap={false}
      />
    </div>
  );
}
