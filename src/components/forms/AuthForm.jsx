import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ErrorText from "../ui/ErrorText";

export default function AuthForm({
  title,
  fields,
  buttonText,
  onSubmit,
  loading,
  error,
  footer,          
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4">
      <Card>
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          {title}
        </h2>

        <ErrorText message={error} />

        <form onSubmit={onSubmit} className="space-y-4">
          {fields.map((field) => (
            <Input key={field.name} {...field} />
          ))}

          <Button type="submit" loading={loading}>
            {buttonText}
          </Button>
        </form>

        {footer && (
          <div className="mt-5 text-center text-sm text-gray-600">
            {footer}
          </div>
        )}
      </Card>
    </div>
  );
}
