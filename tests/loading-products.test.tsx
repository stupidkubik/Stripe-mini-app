import { render } from "@testing-library/react";

import LoadingProducts from "@/app/products/loading";

describe("Products loading state", () => {
  it("renders skeleton grid", () => {
    const { container } = render(<LoadingProducts />);

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
