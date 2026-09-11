import { useEffect } from "react";
import { Button, Form, Input, InputNumber, Modal, Space } from "antd";
import type { HitboxPart, Weapon, WeaponRange, WeaponRecord } from "@/types/weapon";

/**
 * 表单内的射程段：只填终点
 * 起点由上一段终点推导（首段固定为 0），提交时再换算为 WeaponRange 的 start
 */
interface RangeFormItem {
  /** 该段终点（米）；最后一段无终点，表示无上限 */
  end?: number;
  multiplier: number;
}

/** 表单值：除 range 外与 Weapon 一致 */
interface WeaponFormValues extends Omit<Weapon, "range"> {
  range: RangeFormItem[];
}

/** 弹窗打开时的默认值：单段射程（无终点、一直生效），各部位倍率取满额 1 */
const INITIAL_VALUES: WeaponFormValues = {
  name: "",
  damage: { base: 0, armor: 0 },
  fireRate: 1,
  range: [{ multiplier: 1 }],
  hitMultiplier: { head: 1, chest: 1, abdomen: 1, limbs: 1 },
};

/**
 * 领域模型 → 表单值（编辑回填用）
 * 表单只存「终点」：本段终点取下一段起点，末段无下一段故不填终点
 */
function toFormValues(weapon: Weapon): WeaponFormValues {
  return {
    name: weapon.name,
    damage: { ...weapon.damage },
    fireRate: weapon.fireRate,
    range: weapon.range.map((segment, index) => {
      const next = weapon.range[index + 1];
      return next
        ? { end: next.start, multiplier: segment.multiplier }
        : { multiplier: segment.multiplier };
    }),
    hitMultiplier: { ...weapon.hitMultiplier },
  };
}

/**
 * 规范化枪械名称：
 * 1. 将长破折号「—」统一替换为连接符「-」（按这两种符号分割即完成替换）
 * 2. 各段去除首尾空白后，用「 - 」重新拼接，保证连接符左右各有一个空格
 */
function normalizeName(name: string): string {
  return name
    .split(/[-—]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" - ");
}

/** 部位倍率字段：字段名与 HitboxPart 一致，可直接作为 Form.Item 的 name 路径 */
const PART_FIELDS: ReadonlyArray<{ part: HitboxPart; label: string }> = [
  { part: "head", label: "头部倍率" },
  { part: "chest", label: "胸部倍率" },
  { part: "abdomen", label: "腹部倍率" },
  { part: "limbs", label: "四肢倍率" },
];

/** 段序号汉字（一到十），超出范围回退阿拉伯数字 */
const CHINESE_NUMBERS = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"] as const;

/** 生成段标签，例如「一段射程」「二段射程」 */
function segmentLabel(index: number): string {
  return `${CHINESE_NUMBERS[index] ?? index + 1}段射程`;
}

interface WeaponFormModalProps {
  /** 弹窗是否可见，由页面控制 */
  open: boolean;
  /** 编辑目标：null 表示新增，有值则回填并切换为编辑模式 */
  initialWeapon?: WeaponRecord | null;
  /** 取消或关闭弹窗 */
  onCancel: () => void;
  /** 校验通过后提交，交出组装好的武器对象 */
  onSubmit: (weapon: Weapon) => void;
}

/** 填表弹窗：只负责收集与校验输入，不直接接触 store；新增与编辑共用 */
export default function WeaponFormModal({
  open,
  initialWeapon = null,
  onCancel,
  onSubmit,
}: WeaponFormModalProps) {
  /** 表单值为表单结构，射程段的起点在提交时才由终点推导 */
  const [form] = Form.useForm<WeaponFormValues>();
  /** 实时射程段，用于渲染各段的只读起点 */
  const rangeValues = Form.useWatch("range", form);
  /** 是否编辑模式 */
  const isEditing = Boolean(initialWeapon);

  /** 每次打开时重置表单：编辑回填目标数据，新增回到默认值 */
  useEffect(() => {
    if (!open) return;
    if (initialWeapon) form.setFieldsValue(toFormValues(initialWeapon));
    else form.resetFields();
  }, [open, initialWeapon, form]);

  /** 校验通过后把「终点」换算为领域模型的「起点」，再提交并清空表单 */
  async function handleSubmit(): Promise<void> {
    try {
      const values = await form.validateFields();
      const range: WeaponRange[] = values.range.map((item, index) => ({
        // 首段起点恒为 0，其余段起点取上一段终点
        start: index === 0 ? 0 : values.range[index - 1].end!,
        multiplier: item.multiplier,
      }));
      // 名称按命名规则规范化后再提交
      onSubmit({ ...values, name: normalizeName(values.name), range });
      form.resetFields();
    } catch {
      // 校验失败由表单自身展示错误提示
    }
  }

  /** 取消时清空已填内容，避免下次打开残留 */
  function handleCancel(): void {
    form.resetFields();
    onCancel();
  }

  return (
    <Modal
      title={isEditing ? "编辑枪械" : "导入枪械"}
      open={open}
      okText={isEditing ? "保存" : "导入"}
      cancelText="取消"
      forceRender
      onOk={handleSubmit}
      onCancel={handleCancel}
      width={800}
    >
      <Form form={form} layout="vertical" initialValues={INITIAL_VALUES}>
        <Form.Item
          label="枪械名称（命名规则：枪械 - 增伤配件 - 枪管 - 射程枪口 - 增/减伤弹）"
          name="name"
          rules={[{ required: true, message: "请输入枪械名称" }]}
        >
          <Input placeholder="例如 AS VAL - 海啸 或 MK4 - 三连发 - 赛季弹" />
        </Form.Item>

        <Space size="middle" wrap>
          <Form.Item
            label="基础伤害"
            name={["damage", "base"]}
            rules={[{ required: true, message: "请输入基础伤害" }]}
          >
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item
            label="护甲伤害"
            name={["damage", "armor"]}
            rules={[{ required: true, message: "请输入护甲伤害" }]}
          >
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item
            label="射速 RPM"
            name="fireRate"
            rules={[{ required: true, message: "请输入射速" }]}
          >
            <InputNumber min={1} />
          </Form.Item>
          {PART_FIELDS.map(({ part, label }) => (
            <Form.Item
              key={part}
              label={label}
              name={["hitMultiplier", part]}
              rules={[{ required: true, message: `请输入${label}` }]}
            >
              <InputNumber min={0} step={0.1} />
            </Form.Item>
          ))}
        </Space>
        <Form.Item label="射程分段" required>
          <Form.List
            name="range"
            rules={[
              {
                // 射程不能为空：行构造需要取最远一段，空射程会导致 DPS 对比页取不到分段
                validator: async (_rule, value: RangeFormItem[] | undefined) => {
                  if (!value || value.length === 0)
                    throw new Error("至少需要一段射程");
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map((field, index) => {
                  const isLast = index === fields.length - 1;
                  // 只读起点：首段固定 0，其余段取上一段终点
                  const start = index === 0 ? 0 : rangeValues?.[index - 1]?.end;
                  return (
                    // 每段的「起、止、倍率、删除」横向排成一行
                    <Space key={field.key} align="start" size="small">
                      <span style={{lineHeight:"32px"}}>{segmentLabel(index)}</span>
                      <Form.Item>
                        <InputNumber
                          readOnly
                          value={start}
                          addonBefore="起"
                          addonAfter="米"
                          placeholder="起点"
                          // 固定窄宽度：避免 addon 撑宽输入框，保证一行放得下
                          style={{ width: 140 }}
                        />
                      </Form.Item>
                      {!isLast && (
                        <Form.Item
                          name={[field.name, "end"]}
                          rules={[
                            { required: true, message: "请输入射程终点" },
                            {
                              // 终点必须大于本段起点，保证分段严格递增
                              validator: async (_rule, value: number | undefined) => {
                                const from =
                                  index === 0
                                    ? 0
                                    : (form.getFieldValue([
                                        "range",
                                        index - 1,
                                        "end",
                                      ]) as number | undefined);
                                if (
                                  typeof value === "number" &&
                                  typeof from === "number" &&
                                  value <= from
                                )
                                  throw new Error("终点必须大于起点");
                              },
                            },
                          ]}
                        >
                          <InputNumber
                            min={1}
                            addonBefore="止"
                            addonAfter="米"
                            placeholder="终点"
                            // 固定窄宽度：与起点输入框对齐
                            style={{ width: 140 }}
                          />
                        </Form.Item>
                      )}
                      <Form.Item
                        name={[field.name, "multiplier"]}
                        rules={[{ required: true, message: "请输入倍率" }]}
                      >
                        <InputNumber
                            addonBefore="伤害倍率"
                         min={0} step={0.05} placeholder="伤害倍率" 
                            style={{ width: 140 }}
                         />
                      </Form.Item>
                      <Button
                        type="text"
                        danger
                        onClick={() => remove(field.name)}
                      >
                        删除
                      </Button>
                    </Space>
                  );
                })}
                <Form.Item>
                  <Button
                    type="dashed"
                    block
                    onClick={() => add({ multiplier: 1 })}
                  >
                    添加射程段
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>
      </Form>
    </Modal>
  );
}
