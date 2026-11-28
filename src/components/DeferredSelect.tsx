"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { GroupBase, Props as ReactSelectProps } from "react-select";

type DynamicSelectProps = ReactSelectProps<
  unknown,
  boolean,
  GroupBase<unknown>
>;

const LazySelect = dynamic<DynamicSelectProps>(() => import("react-select"), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden="true"
      className="h-10 rounded-md border border-gray-200 bg-white"
    />
  ),
});

export default function DeferredSelect<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(props: ReactSelectProps<Option, IsMulti, Group>) {
  const Select = LazySelect as ComponentType<
    ReactSelectProps<Option, IsMulti, Group>
  >;

  return <Select {...props} />;
}
