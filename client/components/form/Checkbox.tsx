import { Checkbox } from "rsuite";

interface Props {
  register?: any;
  text: string;
  name: string;
}

const CheckboxComponent = ({ register, text, name }: Props) => {
  return (
    <div className="form__unit">
      <Checkbox name={name} inputRef={register}>
        {text}
      </Checkbox>
    </div>
  );
};
export default CheckboxComponent;
