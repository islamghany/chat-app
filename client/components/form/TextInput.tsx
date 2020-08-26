import { Input, ControlLabel } from "rsuite";

interface Props {
  register?: any;
  type: string;
  error?: string | null;
  name: string;
  label?:string;
}

const TextInput = ({ name, register, type, error,label }: Props) => {
  return (
    <div className="form__unit">
      <ControlLabel style={{ textTransform: "capitalize" }}>
        {label || name}
      </ControlLabel>
      <Input type={type} name={name} inputRef={register} size="lg" />
      {error && <span className="form__error">{error}</span>}
    </div>
  );
};
export default TextInput;
