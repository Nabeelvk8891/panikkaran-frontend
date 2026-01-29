import Input from "../ui/Input";
import Button from "../ui/Button";

export default function WorkerProfileForm({
  form,
  onChange,
  onSubmit,
  loading,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Skills (comma separated)"
        name="skills"
        value={form.skills}
        onChange={onChange}
      />

      <Input
        label="Daily Wage (₹)"
        name="dailyWage"
        type="number"
        value={form.dailyWage}
        onChange={onChange}
      />

      <Input
        label="Experience (years)"
        name="experience"
        type="number"
        value={form.experience}
        onChange={onChange}
      />

      <Input
        label="District"
        name="district"
        value={form.district}
        onChange={onChange}
      />

      <Input
        label="Place"
        name="place"
        value={form.place}
        onChange={onChange}
      />

      <Button type="submit" loading={loading}>
        Save Profile
      </Button>
    </form>
  );
}
