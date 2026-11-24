import type {
	ChangeEvent,
	InputHTMLAttributes,
	ReactNode,
	SelectHTMLAttributes,
	TextareaHTMLAttributes,
} from "react";
import { useState } from "react";
import { cn } from "#/lib/utils";

const controlClass = cn(
	"py-3 px-3.5 rounded-md border border-border-color text-sm",
	"bg-bg-card text-text-main w-full",
	"transition-[background-color,border-color] duration-150",
	"ease-out focus:outline-none focus:border-secondary",
	"focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)]",
);

interface FieldProps {
	id: string;
	label: ReactNode;
	required?: boolean;
	/** Spans both columns of the form grid. */
	wide?: boolean;
	children: ReactNode;
}

/** A labelled cell in the admin form grid. */
export function Field({ id, label, required, wide, children }: FieldProps) {
	return (
		<div
			className={cn("flex flex-col gap-1.5 relative", wide && "sm:col-span-2")}
		>
			<label
				htmlFor={id}
				className="text-[13px] font-bold text-text-main flex justify-between items-center"
			>
				{label}
				{required && (
					<>
						{" "}
						<span className="text-primary text-[11px] font-semibold">*</span>
					</>
				)}
			</label>
			{children}
		</div>
	);
}

export function TextInput({
	className,
	...props
}: InputHTMLAttributes<HTMLInputElement>) {
	return <input className={cn(controlClass, className)} {...props} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
	return (
		<textarea className={cn(controlClass, "resize-y min-h-20")} {...props} />
	);
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
	return <select className={controlClass} {...props} />;
}

type StringKeys<T> = {
	[K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

type ControlEvent = ChangeEvent<
	HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>;

/**
 * One state object for a form, plus `bind(key)` which wires a text control's
 * `value`/`onChange` to that key.
 */
export function useFormDraft<T extends object>(initial: () => T) {
	const [draft, setDraft] = useState(initial);
	const set = <K extends keyof T>(key: K, value: T[K]) =>
		setDraft((prev) => ({ ...prev, [key]: value }));
	const bind = <K extends StringKeys<T>>(key: K) => ({
		value: draft[key] as string,
		onChange: (e: ControlEvent) => set(key, e.target.value as T[K]),
	});
	return { draft, set, bind };
}
