describe("test", () => {
  it("tests the test", () => {
    const items = [
      {
        name: "Parallel",
        type: "STAGE",
        children: [
          {
            name: "Linux 17",
            type: "PARALLEL",
            children: [
              ...
            ]
          },
          {
            name: "Windows 17",
            type: "PARALLEL",
            children: [
              ...
            ]
          }
        ]
      }
    ]

    const response = transformItems(items);

    expect(response).toBe([
      {
        name: "Linux 17",
        children: [
          ...
        ]
      },
      {
        name: "Windows 17",
        children: [
          ...
        ]
      }
    ]);
  });
});